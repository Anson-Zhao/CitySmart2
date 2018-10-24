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
        './AutoMenu',
        '../src/heatmap/GlobeInterface',
        '../src/heatmap/Globe',
        '../src/heatmap/Controls',
        '../src/heatmap/HeatmapPanel',
        '../src/ogc/wms/WmsLayerCapabilities'
        ],
    function (WorldWind,
              LayerManager,
              OptionList,
              AutoMenu,
              GlobeInterface,
              Globe,
              Controls,
              HeatmapPanel) {
        "use strict";
        // Load Globe
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

        var preloadWMSLayerName = [];
        var preloadLayer = []; //preload entire layer name
        var layers = globe.layers;
        let bob=[];
        var checked = []; //selected toggle switch value
        var alertVal = true;
        var LayerSelected;
        var arrMenu = [];
        var checkedCount=0;
        var j = 0;
        var Altitude;
        var allCheckedArray=[];

        var createWMSLayer = function (xmlDom) {
            // Create a WmsCapabilities object from the XML DOM
            var wms = new WorldWind.WmsCapabilities(xmlDom);

            // Retrieve a WmsLayerCapabilities object by the desired layer name
            for (var n = 0; n < preloadWMSLayerName.length; n++) {

                var wmsLayerCapability = wms.getNamedLayer(preloadWMSLayerName[n]);

                // Form a configuration object from the wmsLayerCapability object
                var wmsConfig = WorldWind.WmsLayer.formLayerConfiguration(wmsLayerCapability);

                // Modify the configuration objects title property to a more user friendly title
                wmsConfig.title = preloadWMSLayerName[n];

                // Create the WMS Layer from the configuration object
                var wmsLayer = new WorldWind.WmsLayer(wmsConfig);

                console.log(wmsLayer);
                // Add the layers to WorldWind and update the layer manager
                globe.addLayer(wmsLayer);
                layerManager.synchronizeLayerList();
            }
        };

        // Called if an error occurs during WMS Capabilities document retrieval
        var logError = function (jqXhr, text, exception) {
            console.log("There was a failure retrieving the capabilities document: " + text + " exception: " + exception);
        };

        //preload function
        $(document).ready(function() {
            // Preload wmsLayer
            $(".wmsLayer").each(function (i) {
                preloadLayer[i] = $(this).val();
            });
            var preloadLayerStr = preloadLayer + '';//change preloadLayer into a string
            preloadWMSLayerName = preloadLayerStr.split(",");//split preloadLayerStr with ","
            // console.log (preloadWMSLayerName);

            $.get(serviceAddress).done(createWMSLayer).fail(logError);

            //Create Slected Layer Button etc.
            var currentSelectedLayer = document.getElementById("currentSelectedLayer");
            var previousL = document.getElementById("previousL");
            var nextL = document.getElementById("nextL");

            currentSelectedLayer.value = "No Layer Selected";
            currentSelectedLayer.disabled = true;
            previousL.disabled = true;
            nextL.disabled = true;

            $(".wmsLayer").click(function () {
                var layer1 = $(this).val(); //the most current value of the selected switch
                allCheckedArray = $(':checkbox:checked'); //All arrays of the switches that were opened by users
                // console.log(allCheckedArray);
                // console.log(allCheckedArray.length);
                if (alertVal){
                    confirm("Some layers may take awhile to load. Please be patient.")
                }

                var layerRequest = "layername=" + layer1;

                $.ajax({
                    url: 'position',
                    type: 'GET',
                    dataType: 'json',
                    data:layerRequest, //send the most current value of the selected switch to server-side
                    async: false,
                    success: function (results) {
                        LayerSelected = results[0]; //the first object of an array --- Longitude: " ", Latitude: "", Altitude: "", ThirdLayer: "", LayerName: ""
                        console.log(LayerSelected);
                        Altitude = LayerSelected.Altitude * 1000;
                        globe.goTo(new WorldWind.Position(LayerSelected.Latitude,LayerSelected.Longitude,Altitude)); //turn the globe to the position of the layer
                    }
                });

                if (allCheckedArray.length > checkedCount){ //if there is new array was inserted into the allCheckedArray ( If user choose more than 1 switch)

                    checked.push(layer1); //insert current value to "checked" array
                    checkedCount = allCheckedArray.length; //checkedCount now equals to the numbers of arrays that were inserted to allCheckedArray
                    alertVal = false; //alert (only appear at the first time)
                    currentSelectedLayer.value =  LayerSelected.ThirdLayer; //if there are new array was inserted into the allCheckedArray,the value of the opened layer button equals to the name of the switch that user selected
                    arrMenu.push(LayerSelected.ThirdLayer);//insert current ThirdLayer value to arrMenu
                    j = arrMenu.length - 1; //count
                    if(arrMenu.length === 1){ //if the length of arrMenu is equal to 1 /if user only checks one switch.
                        nextL.disabled = true;
                        previousL.disabled = true;
                        currentSelectedLayer.disabled = false;
                    }else{//if user checks over 1 switch
                        previousL.disabled = false;
                        nextL.disabled = true;
                    }
                    // LayerPosition.push(LayerSelected);
                } else { //if there is not new array was inserted into the allCheckedArray / If user un-checks a switch)
                    for( var i = 0 ; i < checked.length; i++) {
                        if (checked[i] === layer1) {
                            checked.splice(i,1); //remove current value from checked array
                            arrMenu.splice(i,1); //remove current ThirdLayer from the array
                            // LayerPosition.splice(i,1); //remove current Latlong from the array
                        }
                    }
                    // val = checked[checked.length - 1];
                    checkedCount = allCheckedArray.length;
                    alertVal = false;
                    currentSelectedLayer.value = arrMenu[arrMenu.length - 1];
                    j = arrMenu.length - 1;
                    if(arrMenu.length === 1){
                        nextL.disabled = true;
                        previousL.disabled = true;
                    }else{
                        if(arrMenu.length === 0){
                            currentSelectedLayer.value = "No Layer Selected";
                            previousL.disabled = true;
                            nextL.disabled = true;
                            currentSelectedLayer.disabled = true;
                            // globe.goTo(new WorldWind.Position(37.0902, -95.7129, 9000000));
                        } else{
                            previousL.disabled = false;
                            nextL.disabled = false;
                        }
                    }
                }

                //turn on/off wmsLayer
                for (var a = 0; a < layers.length; a++) {
                    $(':checkbox:checked').each(function () {
                        if (layers[a].displayName === $(this).val()) {
                            layers[a].enabled = true;
                        } else {
                            bob = $(this).val().split(",");
                            bob.forEach(function (eleValue) {
                                if (layers[a].displayName === eleValue) {
                                    layers[a].enabled = true;
                                }
                            });
                        }
                    });
                    $(':checkbox:not(:checked)').each(function () {
                        if (layers[a].displayName === $(this).val()) {
                            layers[a].enabled = false;
                        } else {
                            bob = $(this).val().split(",");
                            bob.forEach(function (ery) {
                                if (layers[a].displayName === ery) {
                                    layers[a].enabled = false;
                                }
                            });
                        }
                    })
                }
            });

            $('#previousL').click(function(){
                nextL.disabled = false;
                if(j < 1){ //if there was only one switch was checked
                    previousL.disabled = true; //
                }else{//if there was more than one switch was checked
                    j = j - 1;
                    currentSelectedLayer.value = arrMenu[j]; //value of currentSelectedLayer changes to the previous one
                    if (j === 0){
                        previousL.disabled = true; // if there is no previous layer ,then the button would be disabled
                    }
                }
            });

            $('#nextL').click(function(){
                console.log(arrMenu.length);
                console.log(j); //j = j - 1;
                if(j !== arrMenu.length - 1){ // if there is not only one switch was selected
                    console.log(j);
                    if(j === arrMenu.length - 2){
                        nextL.disabled = true;
                    }
                    j = j + 1;
                    previousL.disabled = false;
                    currentSelectedLayer.value = arrMenu[j];
                }
                // else{
                //     nextL.disabled = true; //?
                // }
            });

            //if the opened layer was clicked, the layer shows
            $('#currentSelectedLayer').click(function(){
                // $('.collapse').collapse('hide');
                // var a = document.getElementById("accordion").children; //eight layer menus

                var currentSelectedLayer = "thirdlayer=" + arrMenu[j];
                console.log(arrMenu[j]);
                $.ajax({
                    url: 'thirdL',
                    type: 'GET',
                    dataType: 'json',
                    data:currentSelectedLayer,
                    async: false,
                    success: function (results) {
                        var FirstLayerId = '#' + results[0].FirstLayer;
                        console.log(FirstLayerId);
                        var SecondLayerId = '#' + results[0].FirstLayer + '-' + results[0].SecondLayer;
                        console.log(SecondLayerId);
                        globe.goTo(new WorldWind.Position(results[0].Latitude, results[0].Longitude, results[0].Altitude * 1000));

                        $(FirstLayerId).collapse('show');
                        $(SecondLayerId).collapse('show');

                    }
                });
            });

            $('#globeOrigin').click(function(){
                globe.goTo(new WorldWind.Position(37.0902, -95.7129, 9000000));
            });
        });
    });
