import { MapControl, withLeaflet } from "react-leaflet";
import L from "leaflet";

class Legend extends MapControl {
    createLeafletElement(props) { }

    componentDidMount() {
        // get color depending on population density value
        const getColor = (d) => {
            return d > 95 ? '#125212' : d > 75 ? '#70ff7e' : d > 50 ? '#fef900' : '#BD0026';
        }

        const legend = L.control({ position: "bottomright" });

        legend.onAdd = () => {
            const div = L.DomUtil.create("div", "info legend");
            const grades = [0, 50, 75, 95];
            let labels = [];
            let from;
            let to;

            for (let i = 0; i < grades.length; i++) {
                from = grades[i];
                to = grades[i + 1];
                labels.push(
                    '<i style="background:' + getColor(from + 1) + '"></i> ' + from + (to ? "&ndash;" + to : "+")
                );
            }
            div.innerHTML = labels.join("<br>");
            return div;
        };

        const { map } = this.props.leaflet;
        legend.addTo(map);
    }
}

export default withLeaflet(Legend);