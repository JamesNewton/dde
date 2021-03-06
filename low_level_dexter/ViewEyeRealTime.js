	
// svg_text()
function SetGrid(){
for (var i = 0;i < 511 ;i++){
     var thehtml = svg_circle({cx: i, cy: 0, r: 1})
     append_in_ui("svg_id", thehtml)
    }
}

var scACount = 0
var MinADCx = 5000
var MaxADCx = 0
var MinADCy = 5000
var MaxADCy = 0

//SetGrid()

var centers_string = [[0x000, 0x000],
                      [0x000, 0x000],
                      [0x000, 0x000],
                      [0x000, 0x000],
                      [0x000, 0x000]]
                      
                      
var working_axis = undefined
var AxisTable = [[[500, 0, 0, 0, 0], Dexter.J1_A2D_SIN, Dexter.J1_A2D_COS, [-648000, 0, 0, 0, 0], 800], 
                 [[0, 500, 0, 0, 0], Dexter.J2_A2D_SIN, Dexter.J2_A2D_COS, [0, -350000, 0, 0, 0], 400], 
                 [[0, 0, 500, 0, 0], Dexter.J3_A2D_SIN, Dexter.J3_A2D_COS, [0, 0, -570000, 0, 0], 700], 
                 [[0, 0, 0, 500, 0], Dexter.J4_A2D_SIN, Dexter.J4_A2D_COS, [0, 0, 0, -390000, 0], 300], 
                 [[0, 0, 0, 0, 500], Dexter.J5_A2D_SIN, Dexter.J5_A2D_COS, [0, 0, 0, 0, -648000], 600]]
                 
     
//     AxisTable [axis][0]
function smLinex(size, axis){
  working_axis = axis
  var result = []
  result.push (Dexter.move_all_joints(AxisTable [axis][3]))
  for (var i = 0;i < size;i++){
      result.push (Dexter.move_all_joints_relative(AxisTable [axis][0]))
      result.push (function () { 
         var x = Dexter.my_dex2.robot_status[AxisTable [axis][1]]/10
         var y = Dexter.my_dex2.robot_status[AxisTable [axis][2]]/10
         var thehtml = svg_circle({cx: x, cy: y, r: 1})
         append_in_ui("svg_id", thehtml)
      })}   
  return result
}


function handle1(arg) { 
  if((arg.clicked_button_value === "background_id") ||
     (arg.clicked_button_value === "svg_id")) {
     centers_string[working_axis][0] = "0x" + ((arg.offsetX * 10) * 65536).toString(16)
     centers_string[working_axis][1] = "0x" + ((arg.offsetY * 10) * 65536).toString(16)
     out ("0x" + ((arg.offsetX * 10) * 65536).toString(16) + " " + "0x" + ((arg.offsetY * 10) * 65536).toString(16))
    append_in_ui("svg_id", svg_circle({cx: arg.offsetX, cy: arg.offsetY, r: 3, color: "Red"}))    
  }
  if(arg.clicked_button_value === "submit_id"){
  close_window(arg.window_index)
  }
}

function new_eye_window(){
	show_window({
      title: "Eye View",
      content: 
      svg_svg({id: "svg_id", height: 410, width: 410, html_class: "clickable", child_elements: 
         [svg_rect({id: "submit_id", html_class: "clickable", x: 10, y: 350, width: 75, height: 25, color: "green"})
         ]}),
      width: 500, // window width
      height: 500, // window height
      x: 0,        // Distance from left of DDE window to this window's left
      y: 100,      // Distance from top  of DDE window to this window's top
      callback: handle1
})
}

function centers_output(){
	out("copy from here" , "Red")
	out(centers_string[0][0])
    out(centers_string[0][1])
    out(centers_string[2][0])
    out(centers_string[2][1])
    out(centers_string[1][0])
    out(centers_string[1][1])
    out(centers_string[3][0])
    out(centers_string[3][1])
    out(centers_string[4][0])
    out(centers_string[4][1])
	out("copy to here", "Red")
    out("and place in //(Dexter ip address)/srv/samba/share/AdcCenters.txt")
}
function scan_axis(){
	var retCMD = []
    retCMD.push(Human.enter_number({
                    title: "Calibrate LEDs",
          			task: "Do this calibration first.<br/>" +
          			      "<ol><li>Select each axis (0 through 4),</li>" +
          			      '<li>click Submit get a the "Eye View" window.</li>' +
          			      "<li>With the eye view window drawing points</li>" +
          			      "<li>adjust the current joints 2 pots until the points form a circle.</li>" +
          			      "<li>Wait until points stop drawing (about 30 seconds)</li>" +
          			      "<li>click in the center of the circle.</li>" +
          			      "<li>click the green button</li>" +
                          "<li>repeat for the next joint.</li></ol>",
        			user_data_variable_name: "measurement_axis", 
          			initial_value: 0,
          			min: 0,
        			max: 5,
        			step: 1,
        			}))
    retCMD.push(function () {if (this.user_data.measurement_axis != 5){  return new_eye_window()}})
    retCMD.push(function () {return Dexter.move_all_joints(0, 0, 0, 0, 0)})
    retCMD.push(function () {if (this.user_data.measurement_axis != 5){  return smLinex(AxisTable [this.user_data.measurement_axis][4], this.user_data.measurement_axis)}})
    retCMD.push(function () {if (this.user_data.measurement_axis != 5){  return scan_axis()}})
    return retCMD

}

function init_view_eye(){ //can't eval this until Dexter properly defined.
    new Dexter({name: "basic_move_test_dex", ip_address: "192.168.1.144", port: 50000,
                enable_heartbeat: false, simulate: false})
    new Job({name: "BasicMoveTest2", robot: Robot.basic_move_test_dex, keep_history: false,
         inter_do_item_dur: 5,
         do_list: [ Dexter.move_all_joints(0, 0, 0, 0, 0),
         			make_ins("S", "J1BoundryHigh",648000),
        	        make_ins("S", "J1BoundryLow",-648000),
                    make_ins("S", "J2BoundryLow",-350000),
                    make_ins("S", "J2BoundryHigh",350000),
                    make_ins("S", "J3BoundryLow",-570000),
                    make_ins("S", "J3BoundryHigh",570000),
                    make_ins("S", "J4BoundryLow",-390000),
                    make_ins("S", "J4BoundryHigh",390000),
                    make_ins("S", "J5BoundryLow",-680000),
                    make_ins("S", "J5BoundryHigh",680000),

         			make_ins("S", "MaxSpeed",200000),
                    make_ins("S", "Acceleration",1),
                    make_ins("S", "StartSpeed",7500),
                    scan_axis(),
                    function () {return centers_output()},
                    make_ins("S", "MaxSpeed",300000),
                    make_ins("S", "Acceleration",1),
                    make_ins("S", "StartSpeed",500),
                    Dexter.move_all_joints(0, 0, 0, 0, 0)
                   ]})
}
// Job.BasicMoveTest2.start()


/*
var centers_string = undefined

file_content("AdcCenters.txt", function (str) {centers_string = str})

out (centers_string)

write_file("AdcCenters.txt", centers_string) */



