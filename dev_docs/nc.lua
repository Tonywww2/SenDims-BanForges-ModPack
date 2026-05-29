local rc = peripheral.wrap("back")
local m = peripheral.wrap("right")
local tick_to_stop = 120
local run_flag = true

while (true)
do
    if (not run_flag and rc.getHeatStored() <= 0)
    then
        rc.enableReactor()
        run_flag = true
    end

    if (run_flag)
    then
        local max_heat = rc.getMaxHeatCapacity()
        local curr_heat = rc.getHeatStored()
        local delta_heat = rc.getHeat()

        local p_heat = delta_heat * tick_to_stop + curr_heat

        m.clear()
        m.setCursorPos(1,1)
        m.write("Heat: ", curr_heat)
        m.setCursorPos(2,1)
        m.write("Max Heat: ", max_heat)
        m.setCursorPos(3,1)
        m.write("Delta Heat: ", delta_heat)
        m.setCursorPos(4,1)
        m.write("P Heat: ", p_heat)
        if (p_heat > max_heat * 0.9)
        then
            rc.disableReactor()
            run_flag = false
        end
    end
    
end