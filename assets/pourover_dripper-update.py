"""
Original cone pour-over dripper with paper filter and ground coffee,
sitting on an empty conical glass carafe.
Blender 3.6 / 4.x

Run inside Blender:  Scripting tab > Open > this file > Run Script
Or headless:        blender -b -P pourover_dripper.py
"""
import bpy, bmesh, os
from math import pi, cos, sin

# ---------------- settings ----------------
CERAMIC_COLOR = (0.93, 0.92, 0.89, 1)   # try (0.75, 0.18, 0.12, 1) for a red glaze
RENDER_NOW    = True
SAMPLES       = 256
RES           = 1600
OUT_NAME      = "dripper_render.png"

# ---------------- reset scene ----------------
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete()
for block in (bpy.data.meshes, bpy.data.materials, bpy.data.textures, bpy.data.lights, bpy.data.cameras):
    for b in list(block):
        block.remove(b)

# ---------------- helpers ----------------
def lathe(name, profile, segs=128, closed=False):
    """Revolve a list of (radius, z) points around Z."""
    n = len(profile)
    verts, faces = [], []
    for i in range(segs):
        a = 2 * pi * i / segs
        for r, z in profile:
            verts.append((r * cos(a), r * sin(a), z))
    rows = n if closed else n - 1
    for i in range(segs):
        j = (i + 1) % segs
        for k in range(rows):
            k2 = (k + 1) % n
            faces.append((i*n + k, j*n + k, j*n + k2, i*n + k2))
    me = bpy.data.meshes.new(name)
    me.from_pydata(verts, [], faces)
    me.validate(); me.update()
    bm = bmesh.new(); bm.from_mesh(me)
    bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=1e-6)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    bm.to_mesh(me); bm.free()
    for p in me.polygons:
        p.use_smooth = True
    ob = bpy.data.objects.new(name, me)
    bpy.context.collection.objects.link(ob)
    return ob

def interp(points, steps=12):
    out = []
    for (r1, z1), (r2, z2) in zip(points, points[1:]):
        for s in range(steps):
            t = s / steps
            out.append((r1 + (r2 - r1) * t, z1 + (z2 - z1) * t))
    out.append(points[-1])
    return out

def set_in(bsdf, names, val):
    for nm in names:
        if nm in bsdf.inputs:
            bsdf.inputs[nm].default_value = val
            return

def material(name, color, rough, **kw):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    b = m.node_tree.nodes["Principled BSDF"]
    b.inputs["Base Color"].default_value = color
    b.inputs["Roughness"].default_value = rough
    if "coat" in kw:
        set_in(b, ["Coat Weight", "Clearcoat"], kw["coat"])
    if "sss" in kw:
        set_in(b, ["Subsurface Weight", "Subsurface"], kw["sss"])
    if "trans" in kw:
        set_in(b, ["Transmission Weight", "Transmission"], kw["trans"])
    return m, b

def add_bump(mat, bsdf, scale, strength, distance=0.0005):
    nt = mat.node_tree
    tex = nt.nodes.new("ShaderNodeTexNoise")
    tex.inputs["Scale"].default_value = scale
    tex.inputs["Detail"].default_value = 12
    bump = nt.nodes.new("ShaderNodeBump")
    bump.inputs["Strength"].default_value = strength
    bump.inputs["Distance"].default_value = distance
    nt.links.new(tex.outputs["Fac"], bump.inputs["Height"])
    nt.links.new(bump.outputs["Normal"], bsdf.inputs["Normal"])
    return tex

# dripper geometry (metres)
Z0, R0 = 0.008, 0.011      # bottom of cone
Z1, R1 = 0.090, 0.058      # top of cone
def cone_r(z):
    return R0 + (R1 - R0) * (z - Z0) / (Z1 - Z0)

# ---------------- materials ----------------
ceramic, cb = material("Ceramic", CERAMIC_COLOR, 0.22, coat=0.4)
add_bump(ceramic, cb, 900, 0.03)

paper, pb = material("Filter Paper", (0.97, 0.955, 0.92, 1), 0.92, sss=0.15)
add_bump(paper, pb, 1500, 0.25)

coffee, kb = material("Ground Coffee", (0.11, 0.06, 0.035, 1), 0.85)
nt = coffee.node_tree
vor = nt.nodes.new("ShaderNodeTexVoronoi")
vor.inputs["Scale"].default_value = 2200
ramp = nt.nodes.new("ShaderNodeValToRGB")
ramp.color_ramp.elements[0].color = (0.06, 0.03, 0.018, 1)
ramp.color_ramp.elements[1].color = (0.22, 0.13, 0.07, 1)
nt.links.new(vor.outputs["Distance"], ramp.inputs["Fac"])
nt.links.new(ramp.outputs["Color"], kb.inputs["Base Color"])
bump = nt.nodes.new("ShaderNodeBump")
bump.inputs["Strength"].default_value = 0.8
bump.inputs["Distance"].default_value = 0.0008
nt.links.new(vor.outputs["Distance"], bump.inputs["Height"])
nt.links.new(bump.outputs["Normal"], kb.inputs["Normal"])

surface, sb = material("Surface", (0.55, 0.52, 0.48, 1), 0.55)

glass, gb = material("Glass", (1, 1, 1, 1), 0.02, trans=1.0)
set_in(gb, ["IOR"], 1.5)


# ---------------- dripper body ----------------
body_prof = interp([(R0, Z0), (R1, Z1)], 24) + [(0.063, 0.093), (0.067, 0.092)]
body = lathe("Dripper_Body", body_prof)
sol = body.modifiers.new("Thickness", "SOLIDIFY")
sol.thickness = 0.004; sol.offset = 0; sol.use_even_offset = True
body.modifiers.new("Smooth", "SUBSURF").levels = 2
body.data.materials.append(ceramic)

# base plate (ring with centre hole)
base_prof = [(R0, 0.0), (0.066, 0.0), (0.070, 0.0025), (0.069, 0.006),
             (0.064, 0.008), (0.024, 0.0095), (0.016, 0.014), (R0, 0.014)]
base = lathe("Dripper_Base", base_prof, closed=True)
bv = base.modifiers.new("Bevel", "BEVEL"); bv.width = 0.0008; bv.segments = 3
base.data.materials.append(ceramic)

# handle: a softened loop on the side
bpy.ops.mesh.primitive_torus_add(major_radius=0.013, minor_radius=0.0036,
                                 major_segments=64, minor_segments=24,
                                 location=(0.062, 0, 0.072), rotation=(pi/2, 0, 0))
handle = bpy.context.active_object
handle.name = "Dripper_Handle"
handle.scale = (1.0, 1.0, 1.2)
bpy.ops.object.shade_smooth()
handle.data.materials.append(ceramic)

# ---------------- filter paper ----------------
GAP = 0.003
paper_pts = [(max(cone_r(z) - GAP, 0.0015), z) for z in
             [0.006 + i * (0.092 - 0.006) / 30 for i in range(31)]]
paper_pts[0] = (0.0015, 0.006)
paper_pts += [(0.064, 0.104), (0.069, 0.114)]
filt = lathe("Filter_Paper", paper_pts, segs=160)
filt.modifiers.new("Sub", "SUBSURF").levels = 1
crinkle = bpy.data.textures.new("Crinkle", "CLOUDS")
crinkle.noise_scale = 0.006
crinkle.noise_depth = 3
d = filt.modifiers.new("Crinkles", "DISPLACE")
d.texture = crinkle; d.strength = 0.0012; d.mid_level = 0.5
ps = filt.modifiers.new("Paper", "SOLIDIFY")
ps.thickness = 0.0003; ps.offset = 0
filt.data.materials.append(paper)

# ---------------- coffee bed ----------------
edge_z = 0.060
edge_r = cone_r(edge_z) - GAP - 0.0006
bed_pts = [(0.0005, 0.0635), (0.008, 0.0633), (0.016, 0.0627),
           (0.024, 0.0618), (0.031, 0.0608), (edge_r - 0.002, 0.0603), (edge_r, edge_z)]
bed = lathe("Coffee_Bed", interp(bed_pts, 6), segs=160)
bed.modifiers.new("Sub", "SUBSURF").levels = 2
grind = bpy.data.textures.new("Grind", "CLOUDS")
grind.noise_scale = 0.0025
grind.noise_depth = 4
gd = bed.modifiers.new("Clumps", "DISPLACE")
gd.texture = grind; gd.strength = 0.0012; gd.direction = 'Z'
bed.data.materials.append(coffee)

# ---------------- glass carafe ----------------
carafe_prof = [(0.0005, 0.002), (0.066, 0.002), (0.073, 0.005), (0.076, 0.013),
               (0.0445, 0.103), (0.041, 0.112), (0.041, 0.128), (0.044, 0.134)]

def carafe_r(z):
    for (r1, z1), (r2, z2) in zip(carafe_prof, carafe_prof[1:]):
        if z2 > z1 and z1 <= z <= z2:
            return r1 + (r2 - r1) * (z - z1) / (z2 - z1)
    return carafe_prof[-1][0]

carafe = lathe("Carafe", interp(carafe_prof, 8), segs=160)
cs = carafe.modifiers.new("Glass Wall", "SOLIDIFY")
cs.thickness = 0.0025; cs.offset = 0; cs.use_even_offset = True
carafe.modifiers.new("Smooth", "SUBSURF").levels = 2
carafe.data.materials.append(glass)


# glass handle as a bevelled curve
hc = bpy.data.curves.new("Carafe_Handle", "CURVE")
hc.dimensions = '3D'
hc.bevel_depth = 0.0045
hc.bevel_resolution = 6
sp = hc.splines.new("BEZIER")
pts = [(0.041, 0, 0.121), (0.073, 0, 0.119), (0.087, 0, 0.084), (0.064, 0, 0.049)]
sp.bezier_points.add(len(pts) - 1)
for bp, co in zip(sp.bezier_points, pts):
    bp.co = co
    bp.handle_left_type = bp.handle_right_type = 'AUTO'
hob = bpy.data.objects.new("Carafe_Handle", hc)
bpy.context.collection.objects.link(hob)
hob.data.materials.append(glass)

# sit the dripper on the carafe rim
LIFT = 0.1355
for ob in (body, base, handle, filt, bed):
    ob.location.z += LIFT

# ---------------- set ----------------
bpy.ops.mesh.primitive_plane_add(size=3, location=(0, 0, 0))
floor = bpy.context.active_object; floor.name = "Floor"
floor.data.materials.append(surface)

bpy.ops.mesh.primitive_plane_add(size=3, location=(0, 0.6, 1.5), rotation=(pi/2, 0, 0))
wall = bpy.context.active_object; wall.name = "Backdrop"
wall.data.materials.append(surface)

bpy.ops.object.empty_add(location=(0, 0, 0.125))
target = bpy.context.active_object; target.name = "Focus_Target"

def track(ob):
    c = ob.constraints.new("TRACK_TO")
    c.target = target; c.track_axis = 'TRACK_NEGATIVE_Z'; c.up_axis = 'UP_Y'

def area(name, loc, energy, size, color=(1, 1, 1)):
    ld = bpy.data.lights.new(name, "AREA")
    ld.energy = energy; ld.size = size; ld.color = color
    ob = bpy.data.objects.new(name, ld)
    bpy.context.collection.objects.link(ob)
    ob.location = loc; track(ob)
    return ob

area("Key",  (0.60, -0.45, 0.75), 110, 0.7, (1.0, 0.96, 0.9))
area("Fill", (-0.65, -0.30, 0.35), 30, 0.9, (0.9, 0.95, 1.0))
area("Rim",  (-0.15, 0.50, 0.60), 70, 0.5)

world = bpy.context.scene.world or bpy.data.worlds.new("World")
bpy.context.scene.world = world
world.use_nodes = True
world.node_tree.nodes["Background"].inputs["Color"].default_value = (0.05, 0.05, 0.05, 1)

# ---------------- camera ----------------
cam_data = bpy.data.cameras.new("Camera")
cam_data.lens = 70
cam_data.dof.use_dof = True
cam_data.dof.focus_object = target
cam_data.dof.aperture_fstop = 5.6
cam = bpy.data.objects.new("Camera", cam_data)
bpy.context.collection.objects.link(cam)
cam.location = (0.46, -0.56, 0.30)
track(cam)
bpy.context.scene.camera = cam

# ---------------- render settings ----------------
sc = bpy.context.scene
sc.render.engine = "CYCLES"
sc.cycles.samples = SAMPLES
sc.cycles.use_denoising = True
sc.cycles.transmission_bounces = 16
sc.cycles.max_bounces = 16
sc.render.resolution_x = int(RES * 0.8)
sc.render.resolution_y = RES
try:
    prefs = bpy.context.preferences.addons["cycles"].preferences
    for dev in ("OPTIX", "CUDA", "METAL", "HIP"):
        try:
            prefs.compute_device_type = dev
            prefs.get_devices()
            if any(d.type == dev for d in prefs.devices):
                for d in prefs.devices:
                    d.use = True
                sc.cycles.device = "GPU"
                break
        except TypeError:
            continue
except Exception:
    pass

out_dir = os.path.dirname(bpy.data.filepath) or os.getcwd()
sc.render.filepath = os.path.join(out_dir, OUT_NAME)

if RENDER_NOW:
    bpy.ops.render.render(write_still=True)
    print("Saved render to", sc.render.filepath)
