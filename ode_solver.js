function fun(t,x){ 
    dx = [];
    var rods_power = 0.0;
    rods_status.forEach(element => {
        element[3] -= element[1]/100000.0;
        if(element[3]==0) rods_power+=0;
        else rods_power += element[1]*(element[3]/100.0);
    });
    rods_power/=96.0;
    dx[0] = (50.0*rods_power-x[0])/10.0;
    dx[1] = (x[0]-pump_power*x[1])/100;

    return dx;
}

function multiply_array(arr1, arr2){
    arr = [];
    if(arr1.length == arr1.length){
        for(var i = 0; i<arr1.length;i++){
            arr[i] = arr1[i]*arr2[i];
        }
    }
    return arr;
}

function multiply_array_by_number(arr1, num){
    arr = [];
    for(var i = 0; i< arr1.length; i++){
        arr[i] = arr1[i]*num;
    }
    return arr;
}

function sum_array(arr1, arr2){
    arr = [];
    if(arr1.length == arr1.length){
        for(var i = 0; i<arr1.length;i++){
            arr[i] = arr1[i]+arr2[i];
        }
    }
    return arr;

}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
    }

async function simulation(f, t_span, x0){
    var step=0.01;
    var time = step;
    // var new_x = f(0, x0);
    var out_values = [];
    out_values.push(x0);
    var size = x0.length;
    var prev_x = x0;
    // var iterations = t_span[1]/step - 1;
    var i = 1;
    var power_display = document.getElementById("power_display");
    var temperature_display = document.getElementById("temperature_display");
    var status_display = document.getElementById("status_display");
    var power_error = 0.0;
    var power_error_sum = 0.0;
    var temperature_error_sum = 0.0;
    var prev_power_error = 0.0;
    var prev_temperature_error = 0.0;
    var temperature_error = 0.0;
    var P_KP = 1.0;
    var P_KI = 0.005;
    var P_KD = 0.2;
    var T_KP = 4.0;
    var T_KI = 0.001;
    var T_KD = 0.2;
    while (true){
        if(sim_enable){
            var tmp_x = [];
            var K1 = fun(time-step, prev_x);
            var K2 = fun(time-step+0.5*step,sum_array(prev_x, multiply_array_by_number(K1,0.5*step))); 
            var K3 = fun(time-step+0.5*step,sum_array(prev_x, multiply_array_by_number(K2,0.5*step)));
            var K4 = fun(time-step+step,sum_array(prev_x, multiply_array_by_number(K3,step)));          
            for(var j=0;j<size;j++){
                tmp_x[j]=prev_x[j] + (step/6)*(K1[j]+2*K2[j]+2*K3[j]+K4[j]);
            }
            out_values.push(tmp_x);
            prev_x = tmp_x;
            power_display.innerHTML = tmp_x[0].toFixed(1);
            temperature_display.innerHTML = tmp_x[1].toFixed(1);
            if(tmp_x[1]>1200.0 && tmp_x[1]<=1500.0){
                status_display.innerHTML  = "Temperature high";
                status_display.style.color = "yellow";
            }
            else if(tmp_x[1]>1500.0 && tmp_x[1]<=3000.0){  
                status_display.innerHTML  = "Overheating!";              
                status_display.style.color = "red";
            }
            else if(tmp_x[1]>3000.0){          
                status_display.innerHTML  = "Core melted!";
                status_display.style.color = "black";
                sim_enable = false;
            }
            else if(tmp_x[1]<=1200.0){
                status_display.innerHTML = "Temperature correct";
                status_display.style.color = "green";
            }
            actual_reactor_power = tmp_x[0];
            actual_reactor_temperature = tmp_x[1];
            if(auto_mode){
                power_error = commanded_reactor_power - actual_reactor_power;
                temperature_error = actual_reactor_temperature-  commanded_reactor_temperature;
                power_error_sum += power_error;
                temperature_error_sum += temperature_error;
                var power_reg = P_KP*power_error + P_KI*power_error_sum + P_KD*(power_error - prev_power_error);
                if(power_reg>100.0) power_reg = 100.0
                else if(power_reg<0.0) power_reg = 0.0;
                var temp_reg = T_KP*temperature_error + T_KI*temperature_error_sum + T_KD*(temperature_error - prev_temperature_error);
                if(temp_reg>10.0) temp_reg = 10.0;
                else if(temp_reg<0.0) temp_reg = 0.0;
                pump_power = temp_reg;
                rods_status.forEach(element => {
                    element[1] = power_reg;
                });
                console.log(power_reg);

                prev_power_error = power_error;
                prev_temperature_error = temperature_error;
            }
            
            time+=step;
            i++;
        }
        await sleep(1);
    }
} 

async function real_time_solver(){
    while(true){
        await sleep(10);
    }
}

function sim_stop(){
    if(sim_enable) sim_enable = false;
}

function sim_start(){
    if(!sim_enable) sim_enable = true;
}

simulation(fun, [0, 120], [0,0]);