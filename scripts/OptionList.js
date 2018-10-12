let Continentlevel, Countrylevel,continentObj1,continentObj2,continentObj3;

$(document).ready(function() {
    let x = document.getElementById("myListCountry");
    $.ajax({
        url: "CountryList",
        dataType: 'json',
        success: function (results) {
            // console.log(results);
            let option;
            for (let i = 0; i < results.length; i++) {
                option = new Option(results[i].CountryName, results[i].CountryName);
                x.add(option);
                // console.log(option);
            }
        }
    });
});

function getObjects(obj, key, val) {
    var objects = [];
    for (var i in obj) {
        if (!obj.hasOwnProperty(i)) continue;
        if (typeof obj[i] == 'object') {
            objects = objects.concat(getObjects(obj[i], key, val));
        } else
        //if key matches and value matches or if key matches and value is not passed (eliminating the case where key matches but passed value does not)
        if (i == key && obj[i] == val || i == key && val == '') { //
            objects.push(obj);
        } else if (obj[i] == val && key == '') {
            //only add if the object is not already in the array
            if (objects.lastIndexOf(obj) == -1) {
                objects.push(obj);
            }
        }
    }
    return objects;
}

// function ChangeSelectList(continentlevel) {
//     console.log(continentlevel);
//     Continentlevel = continentlevel;
//     $('.Menu').hide();
//     $('.State').hide();
//     var countryList = document.getElementById("myListCountry");
//     while (countryList.options.length) {
//         countryList.remove(0);
//     }
//
//     if (continentlevel === "AL"){
//         $("#myListCountry").html("<option value='AL'> All Layer </option>");
//         $("#myListState").html("<option value= 'AL'> All Layer </option>");
//         document.getElementById("myListCountry").disabled = true;
//         document.getElementById("myListCountry").style.backgroundColor = "lightgray";
//         document.getElementById("myListState").disabled = true;
//         document.getElementById("myListState").style.backgroundColor = "lightgray";
//         $('.Menu').show();
//         $('.State').show();
//     } else{
//         $("#myListCountry").html("<option value = 'SAS'> -Select a Country- </option>");
//         $("#myListState").html("<option> -Select a State- </option>");
//         document.getElementById("myListCountry").disabled = false;
//         document.getElementById("myListCountry").style.backgroundColor = "white";
//         $('.Menu').hide();
//     }
//
//     $.ajax({
//         url: "CountryList",
//         dataType: 'json',
//         success: function (results) {
//             var option;
//             for (var i = 0; i < results.length; i++) {
//                 if (continentlevel === results[i].ContinentName) {
//                     option = new Option(results[i].CountryName, results[i].CountryName);
//                     countryList.add(option);
//                     if(continentlevel === "All Continents"){
//                         $.ajax({
//                             url: "ClassName",
//                             success: function (res) {
//                                 continentObj1 = res;
//                             }
//                         })
//                     }else{
//                         $.ajax({
//                             url: "ClassName",
//                             success: function (res) {
//                                 continentObj1 = getObjects(res, 'ContinentName', continentlevel);
//                                 console.log(continentObj1);
//                             }
//                         });
//                     }
//                 }
//             }
//         }
//     });
// }

function ChangeCountryList(countrylevel) {
    Countrylevel = countrylevel;
    $('.Menu').hide();
    $('.State').hide();
    var stateList = document.getElementById("myListState");
    while (stateList.options.length) {
        stateList.remove(0);
    }

    if(countrylevel !== "SAS"){
        $("#myListState").html("<option>All Layer</option>");
        document.getElementById("myListState").disabled = false;
        document.getElementById("myListState").style.backgroundColor = "white";
    }
    if(countrylevel === "All Layer"){
        $('.Menu').show();
        $('.State').show();
        $("#myListState").html("<option>All Layer</option>");
        document.getElementById("myListState").disabled = true;
        document.getElementById("myListState").style.backgroundColor = "lightgray";
        $("#myListCity").html("<option>All Layer</option>");
        document.getElementById("myListCity").disabled = true;
        document.getElementById("myListCity").style.backgroundColor = "lightgray";
    }

    var country = "countrylevel="+ countrylevel;

    $.ajax({
        url: "StateList",
        method: 'GET',
        dataType: 'json',
        data: country,
        success: function (results) {
            // console.log(results);
            stateList.add(new Option("-Select a State-", "Select a state"));
            for(var j = 0; j < results.length; j++){
                // if(countrylevel === results[j].StateName ){
                    var option = new Option(results[j].StateName, results[j].StateName);
                    stateList.add(option);
                    console.log (stateList)
                //}
            }
        }
    });
}


function ChangeStateList(statelevel) {
    var cityList = document.getElementById("myListCity");
    while (cityList.options.length) {
        cityList.remove(0);
    }
    $('.Menu').hide();
    $('.State').hide();

    if(statelevel!== "SAS"){
        $("myListCity").html("<option> -Select a City- </option>");
        document.getElementById("myListCity").disabled = false;
        document.getElementById("myListCity").style.backgroundColor = "white";
    }
    var state = "statelevel="+ statelevel;

    $.ajax({
        url: "CityList",
        method: 'GET',
        dataType: 'json',
        data:state,
        success: function (results) {
            console.log(results);
            cityList.add(new Option("-Select a City-", "Select a City"));
            for(var j = 0; j < results.length; j++){
                var option = new Option(results[j].CityName, results[j].CityName);
                cityList.add(option);
                console.log (results[j].CityName);
                console.log (cityList)
            }
        }
    });
}

function ChangeCityList(citylevel){
    console.log(citylevel);
    var city = "citylevel="+ citylevel;
    console.log(city);

    $.ajax({
        url: "ClassName",
        method: 'GET',
        dataType: 'json',
        data:city,
        success: function (results) {
            console.log(results);
            // for (var i= 0; i<results.length; i++ ) {
                if (citylevel !== "SAS") {
                    myFunction();
                }
            }
        // }
    });

}
// function myFunction(index) {
//     var obj1 = continentObj3[index].FirstLayer;
//     var obj2 = continentObj3[index].SecondLayer;
//     var obj3 = continentObj3[index].ThirdLayer;
//     var className1 = "." + obj1;
//     var className2 = "." + obj2;
//     var className3 = "." + obj3;
//     $(className1).show();
//     $(className2).show();
//     $(className3).show();
//     console.log(className1)
// }
function myFunction() {
    var obj1 = cityName.FirstLayer;
    var obj2 = cityName.SecondLayer;
    var obj3 = cityName.ThirdLayer;
    var className1 = "." + obj1;
    var className2 = "." + obj2;
    var className3 = "." + obj3;
    $(className1).show();
    $(className2).show();
    $(className3).show();
}