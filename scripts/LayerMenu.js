/*
* Copyright 2015-2017 WorldWind Contributors
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*     http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/

requirejs(['./WorldWindShim',
        './LayerManager',
        './OptionList',
        '../src/heatmap/GlobeInterface',
        '../src/heatmap/Globe',
        '../src/heatmap/Controls',
        '../src/heatmap/HeatmapPanel',
        '../src/ogc/wms/WmsLayerCapabilities'
        ],
    function (WorldWind,
              LayerManager,
              OptionList,
              GlobeInterface,
              Globe,
              Controls,
              HeatmapPanel) {
        "use strict";

        var globe = new Globe({id: "canvasOne"});
        var controls = new Controls(globe);
        var gInterface = new GlobeInterface(globe);
        // var heatmapPanel = new HeatmapPanel(globe, gInterface.globe.navigator, gInterface.globe.worldWindowController, controls);

        // Create a layer manager for controlling layer visibility.
        var layerManager = new LayerManager(globe);

        //Tell wouldwind to log only warnings and errors.
        WorldWind.Logger.setLoggingLevel(WorldWind.Logger.LEVEL_WARNING);

        globe.goTo(new WorldWind.Position(37.0902, -95.7129, 9000000));

        // Web Map Service information from NASA's Near Earth Observations WMS
        // var serviceAddress = "http://cs.aworldbridgelabs.com:8080/geoserver/ows?service=WMS&request=GetCapabilities&version=1.1.1";
        var serviceAddress = "https://cors.aworldbridgelabs.com/http://cs.aworldbridgelabs.com:8080/geoserver/ows?service=wms&version=1.3.0&request=GetCapabilities";

        var layerName = [];
        var preloadLayer = []; //preload entire layer name
        var layers = globe.layers;
        var checked = [];
        var val;
        var alertVal = true;
        var LayerSelected;
        var ThirdLayer = [];
        var checkedCount=0;
        var j = 0;
        var LayerPosition = [];
        var Altitude;
        var currentCheckedArray=[];

        $(document).ready(function () {
            var openedLayer = document.getElementById("openedLayer");
            var previousL = document.getElementById("previousL");
            var nextL = document.getElementById("nextL");

            openedLayer.value = "No Layer Selected";
            openedLayer.disabled = true;
            previousL.disabled = true;
            nextL.disabled = true;

            $(".wmsLayer").each(function (i) {
                preloadLayer[i] = $(this).val();
            });
            console.log(preloadLayer);

            $(".wmsLayer").click(function () {
                console.log('toggle switch clicked!');
                var layer1 = $(this).val();
                console.log(layer1);
                currentCheckedArray = $(':checkbox:checked');
                console.log(currentCheckedArray);

                if (currentCheckedArray.length > 0 && alertVal){
                    confirm("Some layers may take awhile to load. Please be patient.")
                }

                var layerRequest = "layername=" + layer1;
                $.ajax({
                    url: 'position',
                    type: 'GET',
                    dataType: 'json',
                    data:layerRequest,
                    async: false,
                    success: function (results) {
                        LayerSelected = results;
                        Altitude = LayerSelected.Altitude * 1000;
                        globe.goTo(new WorldWind.Position(LayerSelected.Latitude,LayerSelected.Longitude,Altitude));
                    }
                });


                if (currentCheckedArray.length > checkedCount){
                    checked.push(layer1); //insert current value to checked
                    // val = checked[checked.length - 1];
                    checkedCount = currentCheckedArray.length;
                    alertVal = false;
                    openedLayer.value =  LayerSelected.ThirdLayer;
                    ThirdLayer.push(LayerSelected.ThirdLayer);//insert current ThirdLayer value to ThirdLayer
                    j = ThirdLayer.length - 1;
                    if(ThirdLayer.length === 1){
                        nextL.disabled = true;
                        previousL.disabled = true;
                        openedLayer.disabled = false;
                    }else{
                        previousL.disabled = false;
                        nextL.disabled = true;
                    }
                    LayerPosition.push(LayerSelected);
                } else {
                    for( var i = 0 ; i < checked.length; i++) {
                        if (checked[i] === layer1) {
                            checked.splice(i,1); //remove current value from checked array
                            ThirdLayer.splice(i,1); //remove current ThirdLayer from the array
                            LayerPosition.splice(i,1); //remove current Latlong from the array
                        }
                    }
                    // val = checked[checked.length - 1];
                    checkedCount = currentCheckedArray.length;
                    alertVal = false;
                    openedLayer.value = ThirdLayer[ThirdLayer.length - 1];
                    j = ThirdLayer.length - 1;
                    if(ThirdLayer.length === 1){
                        nextL.disabled = true;
                        previousL.disabled = true;
                    }else{
                        if(ThirdLayer.length === 0){
                            openedLayer.value = "No Layer Selected";
                            previousL.disabled = true;
                            nextL.disabled = true;
                            openedLayer.disabled = true;
                            // globe.goTo(new WorldWind.Position(37.0902, -95.7129, 9000000));
                        } else{
                            previousL.disabled = false;
                            nextL.disabled = true;
                        }
                    }

                }

                for (var a = 0; a < layers.length; a++) {
                    $(':checkbox:checked').each(function () {
                        if (layers[a].displayName === $(this).val()) {
                            layers[a].enabled = true;
                        }
                    });
                    $(":checkbox:not(:checked)").each(function () {
                        if (layers[a].displayName === $(this).val()) {
                            layers[a].enabled = false;
                        }
                    })
                }
            });

            $('#previousL').click(function(){
                console.log("hh");
                nextL.disabled = false;
                if(j < 1){
                    previousL.disabled = true;
                }else{
                    j = j - 1;
                    openedLayer.value = ThirdLayer[j];
                    if (j === 0){
                        previousL.disabled = true;
                    }
                }
            });

            $('#nextL').click(function(){
                if(j !== ThirdLayer.length - 1){
                    if(j === ThirdLayer.length - 2){
                        nextL.disabled = true;
                    }
                    j = j + 1;
                    previousL.disabled = false;
                    openedLayer.value = ThirdLayer[j];
                }else{
                    nextL.disabled = true;
                }
            });

            $('#openedLayer').click(function(){

                // $('.collapse').collapse('hide');
                var a = document.getElementById("accordion").children; //eight layer menus

                var thirdlayer = "thirdlayer=" + ThirdLayer[j];
                $.ajax({
                    url: 'thirdL',
                    type: 'GET',
                    dataType: 'json',
                    data:thirdlayer,
                    async: false,
                    success: function (results) {
                        var FirstLayerId = '#' + results[0].FirstLayer;
                        var SecondLayerId = '#' + results[0].FirstLayer + '-' + results[0].SecondLayer;

                        globe.goTo(new WorldWind.Position(results[0].Latitude, results[0].Longitude, results[0].Altitude * 1000));

                        $(FirstLayerId).collapse('show');
                        $(SecondLayerId).collapse('show');

                    }
                });


            });

            $('#globeOrigin').click(function(){
                globe.goTo(new WorldWind.Position(37.0902, -95.7129, 9000000));
            });

            var strs = preloadLayer + '';
            layerName = strs.split(",");

            var createWMSLayer = function (xmlDom) {
                // Create a WmsCapabilities object from the XML DOM
                var wms = new WorldWind.WmsCapabilities(xmlDom);

                // Retrieve a WmsLayerCapabilities object by the desired layer name
                for (var n = 0; n < layerName.length; n++) {

                    var wmsLayerCapability = wms.getNamedLayer(layerName[n]);

                    // Form a configuration object from the WmsLayerCapability object
                    var wmsConfig = WorldWind.WmsLayer.formLayerConfiguration(wmsLayerCapability);

                    // Modify the configuration objects title property to a more user friendly title
                    wmsConfig.title = layerName[n];

                    // Create the WMS Layer from the configuration object
                    var wmsLayer = new WorldWind.WmsLayer(wmsConfig);
                    console.log (wmsLayer);

                    // Add the layers to WorldWind and update the layer manager
                    globe.addLayer(wmsLayer);
                    layerManager.synchronizeLayerList();
                }
            };

            // Called if an error occurs during WMS Capabilities document retrieval
            var logError = function (jqXhr, text, exception) {
                console.log("There was a failure retrieving the capabilities document: " + text + " exception: " + exception);
            };

            $.get(serviceAddress).done(createWMSLayer).fail(logError);

        });
    });
