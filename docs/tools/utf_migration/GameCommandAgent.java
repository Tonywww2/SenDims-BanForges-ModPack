import java.lang.instrument.Instrumentation;
import java.lang.reflect.Method;
import java.lang.reflect.Modifier;
import java.nio.file.Files;
import java.nio.file.Path;

/** Test-only bridge to native game commands, scheduled on the server thread. */
public class GameCommandAgent {
    public static void agentmain(String argument, Instrumentation instrumentation) throws Exception {
        Class<?> minecraftClass = null;
        for (Class<?> type : instrumentation.getAllLoadedClasses()) {
            if (type.getName().equals("net.minecraft.client.Minecraft")) minecraftClass = type;
        }
        if (minecraftClass == null) throw new IllegalStateException("Minecraft client is not loaded");
        Method instanceMethod = null;
        for (Method method : minecraftClass.getMethods()) {
            if (Modifier.isStatic(method.getModifiers()) && method.getReturnType() == minecraftClass
                    && method.getParameterCount() == 0) instanceMethod = method;
        }
        Object minecraft = instanceMethod.invoke(null);
        Object server = null;
        for (Method method : minecraftClass.getMethods()) {
            if (method.getParameterCount() == 0
                    && method.getReturnType().getName().equals("net.minecraft.client.server.IntegratedServer")) {
                server = method.invoke(minecraft);
            }
        }
        if (server == null) throw new IllegalStateException("Integrated server is not running");
        Object targetServer = server;
        Runnable action = () -> {
            try {
                Object commands = null;
                Object source = null;
                for (Method method : targetServer.getClass().getMethods()) {
                    if (method.getParameterCount() != 0) continue;
                    if (method.getReturnType().getName().equals("net.minecraft.commands.Commands")) commands = method.invoke(targetServer);
                    if (method.getReturnType().getName().equals("net.minecraft.commands.CommandSourceStack")) source = method.invoke(targetServer);
                }
                for (Method method : commands.getClass().getMethods()) {
                    Class<?>[] parameters = method.getParameterTypes();
                    if (parameters.length == 2 && parameters[0].isInstance(source) && parameters[1] == String.class
                            && method.getReturnType() == int.class) {
                        Object result = method.invoke(commands, source, argument);
                        Files.writeString(Path.of("native-command-result.txt"), argument + "\n" + result);
                        return;
                    }
                }
                throw new IllegalStateException("Native command dispatcher was not found");
            } catch (Exception error) {
                try { Files.writeString(Path.of("native-command-result.txt"), error.toString()); }
                catch (Exception ignored) { }
            }
        };
        server.getClass().getMethod("execute", Runnable.class).invoke(server, action);
    }
}
