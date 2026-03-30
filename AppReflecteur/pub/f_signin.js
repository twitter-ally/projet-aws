document.addEventListener("DOMContentLoaded", function () {

    let sugestion = document.getElementById("sugestion");

    function genUsername(name){
        let user = name.toLowerCase().replaceAll(" ", "_");
        let random = Math.floor(Math.random() * 1000);
        return user + "_" + random; 
    }

    sugestion.addEventListener("click", function () {
        let name = document.getElementById("name").value;
        let sug = genUsername(name);
        document.getElementById("sugestionpos").textContent =
            "What do you think about : " + sug;
        document.getElementById("user").value=sug
    });


});