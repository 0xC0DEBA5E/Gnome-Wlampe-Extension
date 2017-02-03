const Main = imports.ui.main;
const Slider = imports.ui.slider;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;
const Lang = imports.lang;
const St = imports.gi.St;
const GLib = imports.gi.GLib;
const Clutter = imports.gi.Clutter;

let menuEntry, brightnessSlider;

// borrowed from: https://github.com/eonpatapon/gnome-shell-extensions-mediaplayer
const SliderItem = new Lang.Class({
    Name: 'SliderItem',
    Extends: PopupMenu.PopupBaseMenuItem,

    _init: function(value) {
        this.parent();
        var layout = new Clutter.TableLayout();
        this._box = new St.Widget({
            style_class: 'slider-item',
            layout_manager: layout});

        this._slider = new Slider.Slider(value);

        layout.pack(this._slider.actor, 2, 0);
        this.actor.add(this._box, {span: -1, expand: true});
    },

    setValue: function(value) {
        this._slider.setValue(value);
    },

    getValue: function() {
        return this._slider._getCurrentValue();
    },

    setIcon: function(icon) {
        this._icon.icon_name = icon + '-symbolic';
    },

    connect: function(signal, callback) {
        this._slider.connect(signal, callback);
    }
});

const BrighnessSlider = new Lang.Class({
    Name: 'BrighnessSlider',
    Extends: SliderItem,

    _init: function() {
        this.parent(0, '');
        this.setValue(128);
    }
})



/**
 * The new entry in the gnome3 status-area.
 * @type {Lang.Class}
 */
const WlampeEntry = new Lang.Class({
    Name: 'WlampeEntry',
    Extends: PanelMenu.Button,

    _init: function () {
        // Attach to status-area:
        this.parent(0.0, 'wlampe', false);
        let button = new St.Bin({
            style_class: 'panel-button',
            reactive: true,
            can_focus: true,
            x_fill: true,
            y_fill: false,
            track_hover: true
        });
        let text = new St.Label({text: "Wlampe"});
        this.actor.add_child(text);
        // Add the Icon:
        this.actor.show();

        this.menu.addAction("Ein", this._lightOn);
        this.menu.addAction("Aus", this._lightOff);

        brightnessSlider = new BrighnessSlider();
        brightnessSlider.connect('value-changed', function () {
            let brightness = (brightnessSlider.getValue() * 128).toFixed(0);
            global.log(brightness);
            GLib.spawn_command_line_sync("curl wlampe.local/brightness?params=" + brightness);
        });

        this.menu.addMenuItem(brightnessSlider);

    },

    _lightOn: function () {
        GLib.spawn_command_line_sync("curl wlampe.local/state?params=1");
    },

    _lightOff: function () {
        GLib.spawn_command_line_sync("curl wlampe.local/state?params=0");
    },

    _setBrightness: function (brightness /* from 0 - 1.0 */) {
        GLib.spawn_command_line_sync("curl wlampe.local/brighness?params=" + brightness * 128);
    }
});


function init() {
}

function enable() {
    menuEntry = new WlampeEntry();
    Main.panel.addToStatusArea('wlampe', menuEntry);
}

function disable() {
    menuEntry.destroy();
}
