import com.sun.tools.attach.VirtualMachine;

public class AttachCommand {
    public static void main(String[] arguments) throws Exception {
        VirtualMachine machine = VirtualMachine.attach(arguments[0]);
        try { machine.loadAgent(arguments[1], arguments[2]); }
        finally { machine.detach(); }
    }
}
