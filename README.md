# Form vaildation exmaples
Create validator libraries in Javascript.

#Examples

__example 1:__ [demo live](https://ngodinhtri.github.io/form_vaildation/example1/index.html)
```html
<script>
  Validator({
    form: "#myForm",
    formGroup: ".form-group",
    formMessage: ".form-message",
    rules: [
      Validator.isRequired("#fullname"),
      Validator.isRequired("#email"),
      Validator.isEmail("#email"),
      Validator.isRequired("#password"),
      Validator.minLength("#password", 6),
      Validator.isRequired("#password-confirmation"),
      Validator.isConfirmed(
        "#password-confirmation",
        "#password",
        "Passwords are not matching"
      ),
      Validator.isRequired("#avatar"),
      Validator.isRequired("#country"),
      Validator.isRequired("input[name='gender']"),
    ],
    onSubmit: function (data) {
      console.log(data);
    },
  });
</script>
```    

__example 2:__ [demo live](https://ngodinhtri.github.io/form_vaildation/example2/index.html)
```html
<script>
    let myValidator = new Validator("#myForm");
    myValidator.onSubmit = (data) => {
      console.log(data);
    };
</script>
```
      
