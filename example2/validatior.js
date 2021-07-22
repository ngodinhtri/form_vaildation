function Validator(selector) {
  const formElement = document.querySelector(selector);
  //elements of form element
  const formGroup = ".form-group";
  const formMessage = ".form-message";

  let validatorRules = {
    required: (value, message) => {
      return value ? undefined : message || "This field is required";
    },

    email: (value, message) => {
      let regex =
        /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
      return regex.test(value)
        ? undefined
        : message || "You have entered an invalid email address.";
    },

    min: (min, message) => {
      return (value) => {
        return value.length >= min
          ? undefined
          : message || `The password must be at least ${min} characters long`;
      };
    },
    confirmation: (passwordSelector, message) => {
      return (value) => {
        let password = formElement.querySelector(passwordSelector).value;
        return value === password
          ? undefined
          : message || "Password must be same.";
      };
    },
  };
  //Save rules by selectors
  let rules = {};

  //formElement is exist ?
  if (formElement) {
    //get all inputElements
    const inputElements = formElement.querySelectorAll(
      "[name][rules]:not([disabled])"
    );

    for (let inputElement of inputElements) {
      //create an array of rules on each inputElement
      let ruleStrArray = inputElement.getAttribute("rules").split("|");

      for (let ruleStr of ruleStrArray) {
        //get corresponding rule
        let rule = validatorRules[ruleStr];

        //if rule has ':' => overwrite rule
        if (ruleStr.includes(":")) {
          let ruleInfo = ruleStr.split(":");
          rule = validatorRules[ruleInfo[0]](ruleInfo[1]);
        }
        //{selector: [rule1, rule2]}
        if (Array.isArray(rules[inputElement.name])) {
          rules[inputElement.name].push(rule);
        } else {
          rules[inputElement.name] = [rule];
        }
      }

      //-------------
      /* Handle blur event*/
      inputElement.onblur = handleValidation;
      //-------------
      /* Handle oninput event*/
      inputElement.oninput = removeErrorMessage;
    }

    //Handle validation
    function handleValidation(event) {
      let inputElement = event.target;
      let ruleArray = rules[inputElement.name];
      let value = inputElement.value;

      for (let rule of ruleArray) {
        switch (inputElement.type) {
          case "checkbox":
          case "radio":
            let element = formElement.querySelector(
              `[name="${inputElement.name}"]:checked`
            );
            errorMessage = rule(element);
            break;
          default:
            errorMessage = rule(value);
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
      const parentElement = inputElement.closest(formGroup);
      const messageElement = parentElement.querySelector(formMessage);

      parentElement.classList.add("invalid");
      messageElement.textContent = errorMessage;
    }

    //Remove Error Message
    function removeErrorMessage(event) {
      const inputElement = event.target;
      const parentElement = inputElement.closest(formGroup);
      const messageElement = parentElement.querySelector(formMessage);

      parentElement.classList.remove("invalid");
      messageElement.textContent = "";
    }
  }

  /*----------------------------------------------------------------*/
  //HANDLE FORM SUBMIT EVENT
  formElement.onsubmit = (event) => {
    event.preventDefault();

    const enableInputElements = formElement.querySelectorAll(
      "[name][rules]:not([disabled])"
    );

    let isValidForm = true;

    for (let inputElement of enableInputElements) {
      let isValid = handleValidation({ target: inputElement });
      if (!isValid) {
        isValidForm = false;
      }
    }

    if (!isValidForm) return;

    //check if have custom onSubmit event
    if (typeof this.onSubmit == "function") {
      let funcCustom = this.onSubmit;
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
}
