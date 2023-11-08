module com.example.tjav501stg_12 {
    requires javafx.controls;
    requires javafx.fxml;
    requires java.desktop;


    opens com.example.tjav501stg_12 to javafx.fxml;
    exports com.example.tjav501stg_12;
}