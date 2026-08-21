// Hangszóródoboz — paraméteres terv (kiindulási sablon)
// Még nincs valós specifikáció (meghajtó méret, doboz típus, cél térfogat).
// A paramétereket az első konkrét méretezéskor kell feltölteni.

wall_thickness = 12;
box_width      = 200;
box_height     = 300;
box_depth      = 250;

module box_shell(w, h, d, wall) {
    difference() {
        cube([w, h, d], center = false);
        translate([wall, wall, wall])
            cube([w - 2 * wall, h - 2 * wall, d - wall], center = false);
    }
}

box_shell(box_width, box_height, box_depth, wall_thickness);
