
/* Closure funcion */
var budgetController = (function() {
    
    /* Private methods */
    var x = 23;

    var add = function(a) {
        return x + a;
    }

    /* Methods exposed to the puclic */
    return {
        publicTest: function(b) {

            /**
             * The add function and the value of only is acessible
             * because it is a closure. So, when the value is returned
             * and the context of the function is deleted from execution
             * stack, this values continue to be acessible for the functions.
             */
            return add(b);
        }
    }
})();

/**
 * Controller to the interface
 */
var uiController = (function() {

})();


/**
 * Controller implementing the conection between the controllers
 */
var appController = (function(budgetCtrl, uiCtrl){

    var z = budgetCtrl.publicTest(5);

    return {
        anotherPublic: function() {
            console.log(z)
        }
    }
})(budgetController, uiController);