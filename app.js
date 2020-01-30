
/**
 * BUDGET CONTROLLER
 * 
 * Controller responsável pela obtenção e atualização dos valores dee
 * despesas e recebimentos.
 */
/* Closure funcion 
* The add function and the value of only is acessible
* because it is a closure. So, when the value is returned
* and the context of the function is deleted from execution
* stack, this values continue to be acessible for the functions.
*/
var budgetController = (function () {

    const typeValues = {
        income: 'inc',
        expense: 'exp'
    }

    var data = {
        allItens: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0,
            totalPercentExpenses: 0
        }
    };
    

    var Expense = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var Income = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    return {
        addItem: function(type, description, value) {

            let newItem, ID;

            /* Create a new ID */
            ID = data.allItens[type].length > 0 ? data.allItens[type][data.allItens[type].length - 1].id + 1 : 0;
            /* Create a new item */
            newItem = type === typeValues.expense ? new Expense(ID, description, value) : new Income(ID, description, value);
            /* Push the new item into the array*/
            data.allItens[type].push(newItem)

            /* Return the new element */
            return newItem;
        },
        getBudget: function() {
            return data.totals;
        },
        setBudget: function(totalsUpdated) {
            data.totals = totalsUpdated;
        },
        testing: function() {
            console.log(data);
        }
    }
})();

/**
 * UI CONTROLLER
 * 
 * Controller responsible to controll interface getting and setting
 * values to interface and also listening to events on its buttons.
 */
var uiController = (function () {

    const DOMStrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        addButton: '.add__btn',
        incomeContainer: '.income__list',
        expenseContainer: '.expenses__list'
    }

    /* Buttom add */
    const btnAdd = document.querySelector(DOMStrings.addButton);
    const inputType = document.querySelector(DOMStrings.inputType);
    const inputDescription = description = document.querySelector(DOMStrings.inputDescription);
    const inputValue = document.querySelector(DOMStrings.inputValue);
    const incomeContainer = document.querySelector(DOMStrings.incomeContainer);
    const expenseContainer = document.querySelector(DOMStrings.expenseContainer);

    const incomeLabel = document.querySelector('.budget__income--value');
    const expenseLabel = document.querySelector('.budget__expenses--value');
    const budgetLabel = document.querySelector('.budget__value');
    const percentExpensesLabel = document.querySelector('.budget__expenses--percentage');

    function initializeValuesLabels() {
        incomeLabel.textContent = 0;
        expenseLabel.textContent = 0;
        budgetLabel.textContent = 0;
        percentExpensesLabel.textContent = 0;
    }

    function setUpEventListeners() {
        /* Método acionado quando usuário pressiona tecla enter */
        document.addEventListener('keypress', (event) => {
            if (event.keyCode === 13) {
                addNewItem();
            }
        })

        /* Método acionado ao usuário clicar em adicionar */
        btnAdd.addEventListener('click', () => {
            addNewItem();
        })
    }

    function addNewItem() {
        const values = {
            type: inputType.value,
            description: inputDescription.value,
            value: parseFloat(inputValue.value)
        }

        if(description !== "" && (!isNaN(values.value) && values.value > 0)){
            const newItem = appController.ctrlAddItem(values);
    
            addHtmlListItem(newItem, values.type);
            updateBudgetInterface();
            clearFields();
        }
    }

    function addHtmlListItem(newItem, type) {
        let html, newHtml, element;

        //Create HTML string with placeholder text
        if(type === 'inc') {
            element = incomeContainer;
            html = '<div class="item clearfix" id="income-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">+ %value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';

        } else if(type === 'exp') {
            element = expenseContainer;
            html = '<div class="item clearfix" id="expense-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">- %value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
        }

        //Replace the placeholder text with actual data
        newHtml = html.replace('%id%', newItem.id);
        newHtml = newHtml.replace('%description%', newItem.description);
        newHtml = newHtml.replace('%value%', newItem.value);

        element.insertAdjacentHTML('beforeend', newHtml);
    }

    function updateBudgetInterface() {
        const { inc, exp, totalPercentExpenses } = appController.getCurrentBudget();

        incomeLabel.textContent = inc;
        expenseLabel.textContent = exp;

        budgetLabel.textContent = inc - exp;
        percentExpensesLabel.textContent = totalPercentExpenses;
    }

    function clearFields(){
        let varFields, fildsArr;
        
        varFields = document.querySelectorAll(`${DOMStrings.inputDescription}, ${DOMStrings.inputValue}`);
        fildsArr = Array.prototype.slice.call(varFields);

        fildsArr.forEach( (current, index, array) => {
            current.value = "";
        });
    }

    return {
        init: function() {
            initializeValuesLabels();
            setUpEventListeners();
        }
    }
})();


/**
 * APP CONTROLLER
 * 
 * Controller implementing the conection between the controllers.
 * This controller is responsible to implement the business rules
 * and control the flow of scenarios.
 */
var appController = (function (budgetCtrl, uiCtrl) {

    /**
     * Método que dá início ao fluxo de criação de um item.
     * 
     * @param {*} values 
     */
    var ctrlAddItem = function (values) {

        const { type, description, value } = values;

        const newItem = budgetCtrl.addItem(type, description, value);

        updateBudget(newItem, type);

        return newItem;
    }

    /**
     * Método de auxílio que realiza a atualização dos gastos e 
     * despesas
     */
    function updateBudget(newItem, type) {
        let budget = budgetCtrl.getBudget();

        budget = calculateBudget(budget, newItem, type);

        budgetCtrl.setBudget(budget)
    }

    function calculateBudget(currentBudget, newItem, type) {
        if (type === 'inc') {
            currentBudget.inc += newItem.value;
        } else {
            currentBudget.exp += newItem.value;
        }

        let percent = (currentBudget.exp * 100)/ currentBudget.inc
        currentBudget.totalPercentExpenses = percent;

        return currentBudget;
    }

    /**
     * Método de auxílio que realiza a atualização dos gastos e 
     * despesas
     */
    const getCurrentBudget = function() {
       return budgetCtrl.getBudget();
    }

    return {
        ctrlAddItem: ctrlAddItem,
        getCurrentBudget: getCurrentBudget
    }

})(budgetController, uiController);

uiController.init();