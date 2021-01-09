

man_btn = document.getElementById("manual_btn");
auto_btn = document.getElementById("auto_btn");
man_panel = document.getElementById("manual_panel");
auto_panel = document.getElementById("automatic_panel");
start_btn = document.getElementById("start_btn");
stop_btn = document.getElementById("stop_btn");
start_btn.style.visibility = "hidden";
stop_btn.style.visibility = "hidden";
man_panel.style.visibility = "hidden";
auto_panel.style.visibility = "hidden";
control_enabled = false;


function init_rods_matrix(){
    for(var i = 0; i<=95; i++){
        rods_status.push([false, 0.0, i, 100.0]);
    }
}

function select_rod(element){
    var rod_number = element.id;
    if(rods_status[rod_number][0] == false){
        rods_status[rod_number][0] = true;
        element.style.backgroundColor = 'red';
    }
    else{
        rods_status[rod_number][0] = false;
        element.style.backgroundColor = 'rgb(126, 132, 138)';
    }    
}

function select_all_rods(){
    var element_string;
    if(selected_all==false){
        rods_status.forEach(element => {
            element[0] = true;
            element_string = element[2].toString();
            doc_element = document.getElementById(element_string);
            doc_element.style.backgroundColor = "red";
        });
        selected_all = true;
    }
}

function unselect_all_rods(){
    var element_string;
        rods_status.forEach(element => {
            element[0] = false;
            element_string = element[2].toString()
            doc_element = document.getElementById(element_string);
            doc_element.style.backgroundColor = 'rgb(126, 132, 138)';
        });
        selected_all = false;
}


async function animate_pump(){
    var angle = 0;
    while(true){
        if(sim_enable){
            var comm_string ="rotate("+angle.toString()+"deg)";
            pump.style.transform = comm_string;
            angle+=pump_power;
            if(angle>360) angle = 0;
        }
        await sleep(33);
    }
}

function change_pump_power(slider){
    pump_power = 0.1*slider.value;
}

function change_rod_position(slider){
    rods_status.forEach(element =>{
    var position = slider.value*1.0;
        if(element[0] == true){
            
            element[1]=position;
        }
    });
}

function emergency_shutdown(){
    rods_status.forEach(element =>{
        element[0] = false;
        element[1] = 0.0;
    });
}

function change_reactor_power(slider){
    commanded_reactor_power = slider.value;
    var power_label = document.getElementById("commanded_power_label");
    power_label.innerHTML = "Commanded power: " + commanded_reactor_power + " MW";
}

function auto_select(){
    auto_mode = true;
    select_all_rods();
    if(control_enabled==false){
        control_enabled==true;
        start_btn.style.visibility = "visible";
        stop_btn.style.visibility = "visible";
    }
    man_btn.style.backgroundColor = "brown";
    auto_btn.style.backgroundColor = "red";
    auto_panel.style.visibility = "visible";
    man_panel.style.visibility = "hidden";
}

function manual_select(){
    auto_mode = false;
    if(control_enabled==false){
        control_enabled==true;
        start_btn.style.visibility = "visible";
        stop_btn.style.visibility = "visible";
    }
    man_btn.style.backgroundColor = "red";
    auto_btn.style.backgroundColor = "brown";
    man_panel.style.visibility = "visible";
    auto_panel.style.visibility = "hidden";
}

init_rods_matrix();
animate_pump();