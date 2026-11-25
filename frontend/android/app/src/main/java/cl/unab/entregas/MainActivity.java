package cl.unab.entregas;

import android.os.Bundle;
import androidx.activity.EdgeToEdge;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        // Después de super: antes, la ventana se crearía con el tema del splash, que trae barra de título
        EdgeToEdge.enable(this);
    }
}
