function Validator(options) {
  const formElement = document.querySelector(options.form);

  //array of rules in the html file
  const rules = options.rules;

  //collection of test() by selectors => { selector1:[test1(), test2(),...],... }
  let collectionOfSelectorTest = {};

  rules.forEach((rule) => {
    //get selector and test()
    let selector = rule.selector;
    let test = rule.test;
    //get exactly inputElement
    const inputElements = formElement.querySelectorAll(selector);

    //add test() into selector key
    if (collectionOfSelectorTest[selector]) {
      collectionOfSelectorTest[selector].push(test);
    } else {
      collectionOfSelectorTest[selector] = [test];
    }

    for (let inputElement of inputElements) {
      //handle blur event of the inputElement
      inputElement.onblur = () => {
        validate(selector);
      };

      //handle oninput event of the inputElement
      inputElement.oninput = () => {
        removeErrorMessage(inputElement);
      };
    }
  });

  //-------------
  //onSubmit
  formElement.onsubmit = (event) => {
    event.preventDefault();

    let isValidForm = true;

    //Check if form is valid
    rules.forEach((rule) => {
      let selector = rule.selector;
      //add true or false form validate(selector)
      let isValid = validate(selector);
      if (!isValid) {
        isValidForm = false;
      }
    });

    if (!isValidForm) return;

    //check if have custom onSubmit event
    if (typeof options.onSubmit == "function") {
      let funcCustom = options.onSubmit;
      const enableInputElements = formElement.querySelectorAll(
        "[name]:not([disabled])"
      );
      let data = {};

      for (let element of enableInputElements) {
        switch (element.type) {
          case "checkbox":
            //element.checked == false
            if (element.checked == false) {
              if (!Array.isArray(data[element.name])) {
                data[element.name] = "";
              } else {
                continue;
              }
            }
            //otherwise, element.checked == true
            else {
              if (Array.isArray(data[element.name])) {
                data[element.name].push(element.value);
              } else {
                data[element.name] = [element.value];
              }
            }
            break;
          case "radio":
            if (element.checked == false) continue;
            let checkedElement = formElement.querySelector(
              `[name="${element.name}"]:checked`
            );
            data[checkedElement.name] = checkedElement.value;
            break;
          case "file":
            data[element.name] = element.files;
            break;
          default:
            data[element.name] = element.value;
        }
      }

      funcCustom(data);
    } else {
      formElement.submit();
    }
  };

  //-------------
  //Validate inputElements
  function validate(selector) {
    const inputElement = formElement.querySelector(selector);
    //get the value of the inputElement
    let value = inputElement.value;
    //get all tests of inputElement
    let tests = collectionOfSelectorTest[selector];
    //save errorMessage
    let errorMessage;

    for (let test of tests) {
      switch (inputElement.type) {
        case "checkbox":
        case "radio":
          let element = formElement.querySelector(selector + ":checked");
          errorMessage = test(element);
          break;
        default:
          errorMessage = test(value);
      }
      if (errorMessage) break;
    }

    if (errorMessage) {
      showErrorMessage(errorMessage, inputElement);
    }

    return !errorMessage;
  }

  //Show Error Message
  function showErrorMessage(errorMessage, inputElement) {
    const parentElement = inputElement.closest(options.formGroup);
    const messageElement = parentElement.querySelector(options.formMessage);

    parentElement.classList.add("invalid");
    messageElement.textContent = errorMessage;
  }
  //Remove Error Message
  function removeErrorMessage(inputElement) {
    const parentElement = inputElement.closest(options.formGroup);
    const messageElement = parentElement.querySelector(options.formMessage);

    parentElement.classList.remove("invalid");
    messageElement.textContent = "";
  }
}

//----------------------------------------------------------------
/* Validator methods */
Validator.isRequired = (selector, message) => {
  //return a rule object {selector, test()}
  return {
    selector: selector,
    test: (value) => {
      //when a error occurs, return message, otherwise return undefined.
      return value ? undefined : message || "This field is required.";
    },
  };
};

Validator.isEmail = (selector, message) => {
  return {
    selector: selector,
    test: (value) => {
      let regex =
        /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
      return regex.test(value)
        ? undefined
        : message || "You have entered an invalid email address.";
    },
  };
};

Validator.minLength = (selector, min, message) => {
  return {
    selector: selector,
    test: (value) => {
      return value.length >= min
        ? undefined
        : message || `The password must be at least ${min} characters long`;
    },
  };
};

Validator.isConfirmed = (confirmSelector, originalSelector, message) => {
  return {
    selector: confirmSelector,
    test: (confirmValue) => {
      let originalValue = document.querySelector(originalSelector).value;
      return confirmValue === originalValue
        ? undefined
        : message || "Password must be same.";
    },
  };
};
