#include "lib.jsx";

var doc = app.activeDocument;
var items = doc.pathItems;
var new_doc = app.documents.add(DocumentColorSpace.CMYK);
var arr = new Array();
var points = new Array();
var random = true;
var rastr_options=new RasterizeOptions();
rastr_options.clippingMask=true;
var group = new_doc.groupItems.add();
var temp_items = new Array();
var low_bound = 1000;
var cyan =  new CMYKColor();
var black = new GrayColor();

//---------- DEFINE NOT CALCULATED VALUES ---------
var cell_size = 14.5;
var two_char_diff = 4.063;

// cell offset relative to text frame (pt)
var x_ofset_cell = 6.881;
var y_ofset_cell = -14.982;

//--------------- END DEFINE ---------------




//---------- PARAMETERS ----------
// document size (pt)
var doc_wight = 464.90;
var doc_height = 376.65;

// text frames
var base_font = textFonts.getByName ("PragmaticaC");
var font_size = 7;
var x_ofset_txt = 3;
var y_ofset_txt = 2;

// enable or disable stroke inside grid
var inside_stroke = true;

var stroke_width = 1.5;
var stroke_color = black;

// color params

cyan.cyan = 100;
cyan.gray = 0;
cyan.yellow = 0;
cyan.magenta = 0;
black.gray = 100;

//---------- END PARAMETERS ----------





 for (var i = 0; i < items.length; i++)
 {
 if (items[i].width > 200.0 && items[i].height < 20.0){
                      low_bound = items[i].top + 1;
         }
       }

function Char_Attrib (txt, font, horscale, size, color){
    for (c=0;c<txt.characters.length;c++){
            txt.characters[c].characterAttributes.verticaleScale=100;
            txt.characters[c].characterAttributes.textFont=font;
            txt.characters[c].characterAttributes.horizontalScale=horscale;
            txt.characters[c].characterAttributes.size=size;
            txt.characters[c].characterAttributes.fillColor=color;
        }
}

function get_delta(x, y, width, height){
    return {
        delta_x: x % width,
        delta_y: y % height
    };
}

function round(num, round_to){
return parseFloat(num.toFixed(round_to));
}

function get_grid_params(){
    x_txt_round_arr = new Array();
    y_txt_arr = new Array();
    y_paths_arr = new Array();
    x_paths_arr = new Array();
    for (var i = 0; i < doc.textFrames.length; i++){
        from_text =  doc.textFrames[i];
        text = from_text.contents;
        if (isNaN(text)){
            continue;
        }
        if (from_text.anchor[1] <= low_bound){
            
            continue;
        }
        len = from_text.textRange.length;
        y = from_text.anchor[1];

        x = len == 1 ? from_text.anchor[0]: from_text.anchor[0] + two_char_diff;
        x_round = Math.round(x);
        if (!x_txt_round_arr.includes(x_round)){
            x_txt_round_arr.push(x_round);
        }

        if (!y_txt_arr.includes(y)){
            y_txt_arr.push(y);
        }
    }


    for (var i = 0; i < doc.pathItems.length; i++){
        from_path =  doc.pathItems[i];
        if (from_path.position[1] <= low_bound || ((from_path.width > 0 && from_path.width < 1) || (from_path.height > 0 && from_path.height < 1))){
            
            continue;
        }

        y = from_path.position[1];
        x = from_path.position[0]; 
        if (!x_paths_arr.includes(x)){
            x_paths_arr.push(x);
        }

        if (!y_paths_arr.includes(y)){
            y_paths_arr.push(y);
        }

    }

    return {
        x_count: x_txt_round_arr.length,
        y_count: y_txt_arr.length,
        grid_height: round(Math.max.apply(Math, y_paths_arr) - Math.min.apply(Math, y_paths_arr), 2),
        grid_width: round(Math.max.apply(Math, x_paths_arr) - Math.min.apply(Math, x_paths_arr), 2)
    };
}

function create_color_cells(from_x, from_y, x_count, y_count){

    for (var i = 0; i < x_count; i++){
        for (j = 0; j < y_count; j++){
            rect = new_doc.pathItems.rectangle(0.0, 0.0, rect_width, rect_height);
            rect.pixelAligned = false;
                 rect.width = rect_width;
                 rect.height = rect_height;
                 rect.filled = true;
                 rect.fillColor = random ? black : cyan;
                 random = !random;
                 x = round((from_x + x_ofset_cell) * x_mult + delta.delta_x - (from_x + x_ofset_cell) * x_mult % rect_width, 2) + rect_width * i;
                 y = round((from_y + y_ofset_cell) * y_mult + delta.delta_y - (from_y + y_ofset_cell) * y_mult % rect_height, 2) - rect_height * j;
           rect.position = [x, y];
           rect.duplicate(group);

        }
    }  
}


function create_fake_cells(from_x, from_y, x_count, y_count){
    rect = new_doc.pathItems.rectangle(0.0, 0.0, rect_width, rect_height);
    rect.pixelAligned = false;
    rect.width = rect_width * x_count;
    rect.height = rect_height * y_count;
    x = round((from_x + x_ofset_cell) * x_mult + delta.delta_x - (from_x + x_ofset_cell) * x_mult % rect_width, 2);
    y = round((from_y + y_ofset_cell) * y_mult + delta.delta_y - (from_y + y_ofset_cell) * y_mult % rect_height, 2);
    rect.position = [x, y];
    rect.move(group,  ElementPlacement.PLACEATBEGINNING);
};



var grid_params = get_grid_params();
var rect_width = round(doc_wight / grid_params.x_count, 2);
var rect_height = round(doc_height / grid_params.y_count, 2);
var x_mult = doc_wight / grid_params.grid_width;
var y_mult = doc_height / grid_params.grid_height;
first = true;
for (var i = 0; i < doc.textFrames.length; i++){


    from_text =  doc.textFrames[i];
    text = from_text.contents;
    if (isNaN(text)){
        continue;
    }
    if (from_text.anchor[1] <= low_bound){
        
        continue;
    }
    len = from_text.textRange.length;
    y = from_text.anchor[1];
    x = len == 1 ? from_text.anchor[0]  - two_char_diff: from_text.anchor[0]
    if (first){
       var delta = get_delta(x * x_mult, y * y_mult, rect_width, rect_height);
        first = false;
    }
    x = round((x * x_mult + delta.delta_x -  (x * x_mult) % rect_width), 2);
    y = round((y * y_mult + delta.delta_y - (y * y_mult) % rect_height), 2);
    var rect = new_doc.pathItems.rectangle(0.0, 0.0, rect_width, rect_height);
    rect.pixelAligned = false;
    rect.width = rect_width;
    rect.height = rect_height;
    rect.position = [x , y];
    rect.duplicate(group);
    txt_item = new_doc.textFrames.add();
    txt_item.position = [x + x_ofset_txt, y + y_ofset_txt];
    txt_item.contents = doc.textFrames[i].contents;
    Char_Attrib (txt_item, base_font, 100, font_size, black);
}

for (var i = 0; i < doc.pathItems.length; i++){
    from_path =  doc.pathItems[i];
        if (from_path.filled && from_path.fillColor.red == 0 && from_path.fillColor.blue == 0 && from_path.fillColor.green == 0 && (from_path.width > cell_size - 1 && from_path.height > cell_size - 1 )){
            cells_count_w = Math.round(from_path.width / (cell_size ));
            cells_count_h = Math.round(from_path.height / (cell_size));
            if (cells_count_h > 2 && cells_count_w > 2){
                if (!inside_stroke){
                    create_fake_cells(from_path.position[0], from_path.position[1], cells_count_w, cells_count_h);
                }
                
            } else {

            create_color_cells(from_path.position[0], from_path.position[1], cells_count_w, cells_count_h);
        }
    }
 }





new_doc.rasterize(group, [new_doc.geometricBounds[1], new_doc.geometricBounds[0], new_doc.width, new_doc.height], rastr_options);

for (var i = 0; i < new_doc.pathItems.length; i++) {
    if (new_doc.pathItems[i].clipping){
    new_doc.pathItems[i].clipping=false;
    new_doc.pathItems[i].stroked=true;
    new_doc.pathItems[i].strokeWidth = stroke_width;
    new_doc.pathItems[i].strokeColor = stroke_color;
    } 
}
new_doc.rasterItems.removeAll();
