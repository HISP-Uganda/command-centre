import React, { Component } from 'react';
import L from 'leaflet';

const style = {
    width: "100%",
    height: "600px"
};

const getColor = (d) => {
    return d > 95 ? '#125212' : d > 75 ? '#70ff7e' : d > 50 ? '#fef900' : '#BD0026';
}

export class CCMap extends Component {
    map;
    geojson;



    info = L.control();
    legend = L.control({
        position: 'bottomright'
    });



    style = (feature) => {
        return {
            fillColor: getColor(feature.properties.value),
            weight: 2,
            opacity: 1,
            color: 'white',
            // dashArray: '3',
            fillOpacity: 0.7
        };
    }

    highlightFeature = (e) => {
        var layer = e.target;
        layer.setStyle({
            weight: 5,
            color: '#666',
            dashArray: '',
            fillOpacity: 0.7
        });

        if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
            layer.bringToFront();
        }
        this.info.update(layer.feature.properties);
    }

    resetHighlight = (e) => {
        this.geojson.resetStyle(e.target);
        this.info.update();
    }

    zoomToFeature = (e) => {
        this.map.fitBounds(e.target.getBounds());
    }

    onEachFeature = (feature, layer) => {
        layer.myTag = "myGeoJSON"
        layer.on({
            mouseover: this.highlightFeature,
            mouseout: this.resetHighlight,
            click: this.zoomToFeature
        });
    }

    componentDidMount() {
        this.legend.onAdd = function (map) {

            const div = L.DomUtil.create('div', 'info legend')
            const grades = [0, 50, 75, 95];
            // loop through our density intervals and generate a label with a colored square for each interval
            for (var i = 0; i < grades.length; i++) {
                div.innerHTML +=
                    '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
                    grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
            }

            return div;
        };

        this.info.update = function (props) {
            this._div.innerHTML = '<h4>Percentage Coverage</h4>' + (props ? '<b>' + props.name + '</b><br />' + props.value + '%' : 'Hover over location');
        }

        this.info.onAdd = function (map) {
            this._div = L.DomUtil.create('div', 'info');
            this.update();
            return this._div;
        };
        const { map } = this.props;
        this.map = L.map("map", {
            center: [1.3707295, 32.3032414],
            zoom: 7,
            // layers: [
            //     L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            //         attribution: '&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
            //     })
            // ]
        });
        this.geojson = L.geoJson(map, {
            onEachFeature: this.onEachFeature,
            style: this.style
        })
        this.geojson.addTo(this.map);
        this.info.addTo(this.map);
        this.legend.addTo(this.map);

    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.map !== this.props.map) {
            this.map.eachLayer((layer) => {
                if (layer.myTag && layer.myTag === "myGeoJSON") {
                    this.map.removeLayer(layer)
                }
            });
        }
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.map !== this.props.map) {
            this.geojson = L.geoJson(this.props.map, {
                onEachFeature: this.onEachFeature,
                style: this.style
            });
            this.geojson.addTo(this.map);
        }
    }

    render() {
        return <div id="map" style={style} />;
    }
}