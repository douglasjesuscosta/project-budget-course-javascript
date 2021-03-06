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

    const types = {
        income: 'inc',
        expense: 'exp'
    }

    var data = {
        allItens: {
            exp: [],
            inc: []
        },
        totals: {
            budget: 0,
            exp: 0,
            inc: 0,
            totalPercentExpenses: 0
        }
    };


    var Expense = function (id, description, value, percent = 0) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentExpense = percent;

        Expense.prototype.calcPercentageExpense = function(totalIncome) {
            this.percentExpense = totalIncome > 0 ? Math.round((this.value / totalIncome) * 100) : -1;
        }
    };

    var Income = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    return {
        addItem: function (type, description, value) {

            let newItem, ID, isExpense;

            isExpense = type === types.expense;

            /* Create a new ID */
            ID = data.allItens[type].length > 0 ? data.allItens[type][data.allItens[type].length - 1].id + 1 : 0;

            /* Create a new item */
            if(isExpense) {
                const percentExpense = data.totals.inc && data.totals.inc > 0 ? Math.round((value / data.totals.inc) * 100) : -1;
                newItem = new Expense(ID, description, value, percentExpense); 
            } else {
                newItem = new Income(ID, description, value)
            }

            /* Push the new item into the array*/
            data.allItens[type].push(newItem)

            /* Return the new element */
            return newItem;
        },
        getBudget: function () {
            return data.totals;
        },
        getIncomes: function () {
            return data.allItens.inc;
        },
        getExpenses: function () {
            return data.allItens.exp;
        },
        setExpenses: function(expenses) {
            data.allItens.exp = expenses;  
        },
        setBudget: function (totalsUpdated) {
            data.totals = totalsUpdated;
        },
        testing: function () {
            console.log(data);
        },
        removeItem: function (id, type) {

            data.allItens[type] = data.allItens[type].filter((item) => {
                return item.id !== id;
            })
        },
        updateBudget: function () {
            let totalBudget = 0, sumExpenses = 0, sumIncomes = 0;

            data.allItens.exp.forEach((expense) => {
                sumExpenses += expense;
            });

            data.allItens.inc.forEach((income) => {
                sumIncomes += income;
            })

            totalBudget = sumIncomes - sumExpenses;

            data.totals.inc = sumIncomes;
            data.totals.exp = sumExpenses;
            data.totals.budget = totalBudget;

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
    const types = {
        income: 'inc',
        expense: 'exp'
    }

    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    const DOMStrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        addButton: '.add__btn',
        incomeContainer: '.income__list',
        expenseContainer: '.expenses__list',
        incomeLabel: '.budget__income--value',
        expenseLabel: '.budget__expenses--value',
        budgetValue: '.budget__value',
        expenseTotalPercentage: '.budget__expenses--percentage',
        container: '.container',
        containerIncomes: '.income',
        containerExpenses: '.expenses',
        dateLabel: '.budget__title--month'
    }

    /* Buttom add */
    const btnAdd = document.querySelector(DOMStrings.addButton);
    const inputType = document.querySelector(DOMStrings.inputType);
    const inputDescription = description = document.querySelector(DOMStrings.inputDescription);
    const inputValue = document.querySelector(DOMStrings.inputValue);
    const incomeContainer = document.querySelector(DOMStrings.incomeContainer);
    const expenseContainer = document.querySelector(DOMStrings.expenseContainer);

    const incomeLabel = document.querySelector(DOMStrings.incomeLabel);
    const budgetLabel = document.querySelector(DOMStrings.budgetValue);
    const expenseLabel = document.querySelector(DOMStrings.expenseLabel);
    const percentExpensesLabel = document.querySelector(DOMStrings.expenseTotalPercentage);

    function initializeValuesLabels() {
        updateBudgetInterface({
            budget: 0,
            inc: 0,
            exp: 0,
            totalPercentExpenses: -1
        });
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

        document.querySelector(DOMStrings.containerExpenses).addEventListener(
            'click', (event) => { deleteItem(event, types.expense) });

        document.querySelector(DOMStrings.containerIncomes).addEventListener(
            'click', (event) => { deleteItem(event, types.income) });

        document.querySelector(DOMStrings.inputType).addEventListener('change', onChangeType);
    }

    const onChangeType = function() {

        inputValue.classList.toggle('red-focus');
        inputDescription.classList.toggle('red-focus');
        inputType.classList.toggle('red-focus');
        btnAdd.classList.toggle('red');
    }

    const deleteItem = function (event, type) {
        const isIncome = type === types.income;
        const idItem = event.target.id;

        if (idItem) {
            appController.ctrlRemoveItem(idItem, type);

            elementToRemove = isIncome ? document.querySelector(`#${types.income}-${idItem}`) : document.querySelector(`#${types.expense}-${idItem}`);
            elementToRemove && elementToRemove.parentNode.removeChild(elementToRemove);

            updateBudgetInterface();
            type === types.income && updatePercentExpenseInterface();
        }
    }

    function addNewItem() {
        const values = {
            type: inputType.value,
            description: inputDescription.value,
            value: parseFloat(inputValue.value)
        }

        if (description !== "" && (!isNaN(values.value) && values.value > 0)) {
            const newItem = appController.ctrlAddItem(values);

            addHtmlListItem(newItem, values.type);
            updateBudgetInterface();
            values.type === types.income && updatePercentExpenseInterface();
            clearFields();
        }
    }

    function addHtmlListItem(newItem, type) {
        let html, element;

        //Create HTML string with placeholder text
        if (type === 'inc') {
            element = incomeContainer;
            html = `<div class="item clearfix" id="${types.income}-${newItem.id}"><div class="item__description">${newItem.description}</div><div class="right clearfix"><div class="item__value">${formatNumber(newItem.value, types.income)}</div><div class="item__delete"><button class="item__delete--btn"><i id="${newItem.id}"  class="ion-ios-close-outline"></i></button></div></div></div>`;
        } else if (type === 'exp') {
            element = expenseContainer;
            html = `<div class="item clearfix" id="${types.expense}-${newItem.id}"><div class="item__description">${newItem.description}</div><div class="right clearfix"><div class="item__value">${formatNumber(newItem.value, types.expense)}</div><div class="item__percentage" id="percent-${newItem.id}">${newItem.percentExpense}</div><div class="item__delete"><button class="item__delete--btn"><i id="${newItem.id}" class="ion-ios-close-outline"></i></button></div></div></div>`;
        }

        element.insertAdjacentHTML('beforeend', html);
    }

    function updateBudgetInterface() {

        const { budget, inc, exp, totalPercentExpenses } = appController.getCurrentBudget();

        const typeBudget = budget > 0 ? types.income : types.expense;

        incomeLabel.textContent = formatNumber(inc, types.income);
        expenseLabel.textContent = formatNumber(exp, types.expense);

        budgetLabel.textContent = formatNumber(budget, typeBudget);
        percentExpensesLabel.textContent = totalPercentExpenses >= 0 ? `${totalPercentExpenses}%` : '';
    }

    function updatePercentExpenseInterface() {
        const expenses = appController.getExpenses();

        expenses.forEach(expense => {
            let elementExpense = document.querySelector(`#percent-${expense.id}`);
            elementExpense.textContent = expense.percentExpense > 0 ? expense.percentExpense + '%' : '--';
        });
    }

    function clearFields() {
        let varFields, fildsArr;

        varFields = document.querySelectorAll(`${DOMStrings.inputDescription}, ${DOMStrings.inputValue}`);
        fildsArr = Array.prototype.slice.call(varFields);

        fildsArr.forEach((current, index, array) => {
            current.value = "";
        });
    }

    function formatNumber(num, type){
        num = Math.abs(num);
        num = num.toFixed(2);

        let numSplit, integerPart, decimalPart, sign; 
        numSplit = num.split('.');
        integerPart = numSplit[0];
        decimalPart = numSplit[1];

        integerPart = integerPart.length > 3 ? integerPart.substr(0, integerPart.length - 3) + ',' + integerPart.substr(integerPart.length -3, 3) : integerPart;
        return `${(type === types.income ? '+' : '-')} ${integerPart}.${decimalPart}`;
    }

    function displayMonth() {
        var now, year, month;

        now = new Date();
        year = now.getFullYear();
        month = now.getMonth();

        document.querySelector(DOMStrings.dateLabel).textContent = `${months[month]} ${year}`;

    }

    return {
        init: function () {
            initializeValuesLabels();
            setUpEventListeners();
            displayMonth();
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
        type === 'inc' && updatePercentageExpenses();

        return newItem;
    }

    /**
     * Método de auxílio que realiza a atualização dos gastos e 
     * despesas
     */
    function updateBudget(newItem, type) {
        let budget = budgetCtrl.getBudget();

        budget = calculateBudgetOnInserting(budget, newItem, type);

        budgetCtrl.setBudget(budget)
    }

    function updatePercentageExpenses() {
        const { inc } = budgetController.getBudget();
        let expenses = budgetController.getExpenses();

        expenses && expenses.forEach(expense => {
            expense.calcPercentageExpense(inc);
        })

        budgetController.setExpenses(expenses);
    }

    /**
     * Método acionado na inserção de novas rendas ou gastos.
     * 
     * @param {*} currentBudget 
     * @param {*} newItem 
     * @param {*} type 
     */
    function calculateBudgetOnInserting(currentBudget, newItem, type) {
        if (type === 'inc') {
            currentBudget.inc += newItem.value;
        } else {
            currentBudget.exp += newItem.value;
        }

        let percent = currentBudget.inc > 0 ? Math.round((currentBudget.exp / currentBudget.inc) * 100) : -1;

        currentBudget.totalPercentExpenses = percent;
        currentBudget.budget = currentBudget.inc - currentBudget.exp;

        return currentBudget;
    }

    /**
     * Método para recalcular todos os valores de renda, gastos e 
     * porcentagem de gastos.
     * 
     */
    function updateBudgetOnRemove() {

        let totalIncome = 0, totalExpense = 0, budget = 0, percentExpenses = 0;

        const incomes = budgetCtrl.getIncomes();
        const expenses = budgetCtrl.getExpenses();

        incomes && incomes.forEach((income) => {
            totalIncome += income.value;
        });

        expenses && expenses.forEach((expense) => {
            totalExpense += expense.value;
        });

        budget = totalIncome - totalExpense;
        percentExpenses = totalIncome > 0 ? Math.round((totalExpense / totalIncome) * 100) : -1;

        budgetCtrl.setBudget({
            inc: totalIncome,
            exp: totalExpense,
            budget: budget,
            totalPercentExpenses: percentExpenses
        });
    }

    /**
     * Método de auxílio que realiza a atualização dos gastos e 
     * despesas
     */
    const getCurrentBudget = function () {
        return budgetCtrl.getBudget();
    }

    /**
     * Método que controla o fluxo de excluir itens
     */
    const ctrlRemoveItem = function (itemId, type) {

        let idInteger = !Number.isInteger(itemId) ? parseInt(itemId) : itemId;
        budgetController.removeItem(idInteger, type);

        updateBudgetOnRemove();
        type === 'inc' && updatePercentageExpenses();
    }

    const getExpenses = function(){
        return budgetController.getExpenses();
    }

    return {
        ctrlAddItem: ctrlAddItem,
        ctrlRemoveItem: ctrlRemoveItem,
        getCurrentBudget: getCurrentBudget,
        getExpenses: getExpenses
    }

})(budgetController, uiController);

uiController.init();