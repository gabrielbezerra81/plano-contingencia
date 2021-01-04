/* eslint-disable react-hooks/exhaustive-deps */
// Refactored v3 EditControl.js file
import { useCallback, useEffect, useState } from "react";
import Draw from "leaflet-draw"; // eslint-disable-line
import L from "leaflet";
import { EditControl } from "react-leaflet-draw";

import { FeatureGroup } from "react-leaflet";

import "./config";
import produce from "immer";

// function EControl(props) {
//   const context = useLeafletContext();
//   const controlRef = useRef();
//   const propsRef = useRef(props);

//   const onDrawCreate = useCallback(
//     (e) => {
//       context.layerContainer.addLayer(e.layer);
//       props.onCreated && props.onCreated(e);
//     },
//     [props, context],
//   );

//   useEffect(() => {
//     for (const key in eventHandlers) {
//       context.map.on(eventHandlers[key], (evt) => {
//         let handlers = Object.keys(eventHandlers).filter(
//           (handler) => eventHandlers[handler] === evt.type,
//         );
//         if (handlers.length === 1) {
//           let handler = handlers[0];
//           props[handler] && props[handler](evt);
//         }
//       });
//     }

//     context.map.on(leaflet.Draw.Event.CREATED, onDrawCreate);
//     const options = {
//       edit: {
//         ...props.edit,
//         featureGroup: context.layerContainer,
//       },
//     };
//     if (props.draw) {
//       options.draw = { ...props.draw };
//     }
//     if (props.position) {
//       options.position = props.position;
//     }

//     controlRef.current = new Control.Draw(options);
//     controlRef.current.addTo(context.map);
//     props.onMounted && props.onMounted(controlRef.current);

//     return () => {
//       context.map.off(leaflet.Draw.Event.CREATED, onDrawCreate);

//       for (const key in eventHandlers) {
//         if (props[key]) {
//           context.map.off(eventHandlers[key], props[key]);
//         }
//       }
//     };
//   }, [context, props, onDrawCreate]);

//   useEffect(() => {
//     // If the props haven't changed, don't update
//     if (
//       isEqual(props.draw, propsRef.current.draw) &&
//       isEqual(props.edit, propsRef.current.edit) &&
//       props.position === propsRef.current.position
//     ) {
//       return false;
//     }

//     const options = {
//       edit: {
//         ...props.edit,
//         featureGroup: context.layerContainer,
//       },
//     };
//     if (props.draw) {
//       options.draw = { ...props.draw };
//     }
//     if (props.position) {
//       options.position = props.position;
//     }

//     controlRef.current.remove(context.map);
//     controlRef.current = new Control.Draw(options);
//     controlRef.current.addTo(context.map);

//     // Remount the new draw control
//     props.onMounted && props.onMounted(controlRef.current);
//     propsRef.current = props;
//   }, [props.draw, props.edit, props.position, context, props]);

//   return null;
// }

// EditControl.propTypes = {
//   ...Object.keys(eventHandlers).reduce((acc, val) => {
//     acc[val] = PropTypes.func;
//     return acc;
//   }, {}),
//   onCreated: PropTypes.func,
//   onMounted: PropTypes.func,
//   draw: PropTypes.shape({
//     polyline: PropTypes.oneOfType([PropTypes.object, PropTypes.bool]),
//     polygon: PropTypes.oneOfType([PropTypes.object, PropTypes.bool]),
//     rectangle: PropTypes.oneOfType([PropTypes.object, PropTypes.bool]),
//     circle: PropTypes.oneOfType([PropTypes.object, PropTypes.bool]),
//     marker: PropTypes.oneOfType([PropTypes.object, PropTypes.bool]),
//   }),
//   edit: PropTypes.shape({
//     edit: PropTypes.oneOfType([PropTypes.object, PropTypes.bool]),
//     remove: PropTypes.oneOfType([PropTypes.object, PropTypes.bool]),
//     poly: PropTypes.oneOfType([PropTypes.object, PropTypes.bool]),
//     allowIntersection: PropTypes.bool,
//   }),
//   position: PropTypes.oneOf([
//     "topright",
//     "topleft",
//     "bottomright",
//     "bottomleft",
//   ]),
// };

// export default EditControl;

const DrawControl = ({ drawedPolygons: _, setDrawedPolygons }) => {
  const [_editableFG, setEditableFG] = useState(null);

  const onFeatureGroupReady = useCallback((reactFGref) => {
    if (!reactFGref) {
      return;
    }

    setEditableFG(reactFGref);
  }, []);

  const onChange = () => {
    // _editableFG contains the edited geometry, which can be manipulated through the leaflet API

    if (!_editableFG) {
      return;
    }

    const geojsonData = _editableFG.leafletElement.toGeoJSON();

    console.log(_editableFG.leafletElement);

    // updateGeoJSONData(geojsonData);
  };

  const onEdited = useCallback(
    (e) => {
      let numEdited = 0;
      e.layers.eachLayer((layer) => {
        numEdited += 1;
      });
      // console.log(`_onEdited: edited ${numEdited} layers`, e);

      onChange();
    },
    [onChange],
  );

  const onCreated = useCallback(
    (e) => {
      let type = e.layerType;
      let layer = e.layer;

      const layerData = layer.toGeoJSON();

      layerData.properties.id = layer._leaflet_id;

      if (type === "circle") {
        layerData.properties.radius = layer.getRadius();
        // console.log("_onCreated: circle created", e);
      } else {
        // console.log("_onCreated: something else created:", type, e);
      }

      layer.feature = {
        properties: layerData.properties,
      };

      setDrawedPolygons((oldValues) => {
        const updatedGeoJSON = [...oldValues, layerData];

        localStorage.setItem("drawedPolygons", JSON.stringify(updatedGeoJSON));

        return updatedGeoJSON;
      });
    },
    [setDrawedPolygons],
  );

  const onDeleted = useCallback(
    (e) => {
      const idsToRemove = [];

      for (const key in e.layers._layers) {
        const layer = e.layers._layers[key];
        idsToRemove.push(Number(layer.feature.properties.id));
      }

      setDrawedPolygons((oldValues) => {
        const filtered = oldValues.filter(
          (layerData) => !idsToRemove.includes(layerData.properties.id),
        );

        localStorage.setItem("drawedPolygons", JSON.stringify(filtered));

        return filtered;
      });
    },
    [setDrawedPolygons],
  );

  // const _onMounted = (drawControl) => {
  //   console.log("_onMounted", drawControl);
  // };

  // const _onEditStart = (e) => {
  //   console.log("_onEditStart", e);
  // };

  // const _onEditStop = (e) => {
  //   console.log("_onEditStop", e);
  // };

  // const _onDeleteStart = (e) => {
  //   console.log("_onDeleteStart", e);
  // };

  useEffect(() => {
    if (_editableFG) {
      let leafletFG = _editableFG.leafletElement;

      const data = localStorage.getItem("drawedPolygons");

      if (data) {
        const parsedData = JSON.parse(data);
        const leafletGeoJSON = new L.GeoJSON(parsedData, {
          pointToLayer: function (feature, latlng) {
            if (feature.properties.radius) {
              return new L.Circle(latlng, feature.properties.radius);
            }

            return;
          },
        });

        setDrawedPolygons(parsedData);

        leafletGeoJSON.eachLayer((layer) => {
          leafletFG.addLayer(layer);
        });
      }
    }
  }, [_editableFG]);

  return (
    <FeatureGroup ref={onFeatureGroupReady}>
      <EditControl
        position="topright"
        onEdited={onEdited}
        onCreated={onCreated}
        onDeleted={onDeleted}
        // onMounted={_onMounted}
        // onEditStart={_onEditStart}
        // onEditStop={_onEditStop}
        // onDeleteStart={_onDeleteStart}
        draw={{
          marker: false,
        }}
      />
    </FeatureGroup>
  );
};

export default DrawControl;
