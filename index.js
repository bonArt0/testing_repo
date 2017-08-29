"use strict";

var myForm = document.getElementById('myForm');
myForm.fields = [
    'fio',
    'email',
    'phone'
];

myForm.validate = function () {
    function FioMatched(str) {
        return str.replace(/ +/g, ' ').trim().split(' ').length === 3;
    }
    function EmailMatched(str) {
        return str.match(/^[^@]*@ya(?:ndex)?\.(?:ru|ua|by|kz|com)$/);
    }
    function PhoneMatched(str) {
        var formatMatched = str.replace(" ", "").match(/^\+7\(\d{3}\)\d{3}-\d{2}-\d{2}$/g),
            numberSumMatched = str.replace(/[+()\- ]/g, '').split('').reduce(function(a, b) {return +a + +b;}, 0) <= 30;

        return formatMatched && numberSumMatched;
    }

    var errorFields = [];
    var data = myForm.getData();

    if (!FioMatched(data.fio)) {
        errorFields.push('fio');
    }
    if (!EmailMatched(data.email)) {
        errorFields.push('email');
    }
    if (!PhoneMatched(data.phone)) {
        errorFields.push('phone');
    }

    return {
        'isValid' : errorFields.length === 0,
        'errorFields' : errorFields
    };
};
myForm.getData = function () {
    function GetInput(form, name) {
        return $(form).children('input[name="' + name + '"]').val();
    }

    var output = {};

    for (var i = 0; i < this.fields.length; i++) {
        output[this.fields[i]] = GetInput(this, this.fields[i]);
    }

    return output;
};
myForm.setData = function (object) {
    function SetInput(form, name, value) {
        try {
            $(form).children('input[name="' + name + '"]').val(value);
        }
        catch (e) { return false; }
    }

    for (var i = 0; i < this.fields.length; i++) {
        SetInput(this, this.fields[i], object[this.fields[i]]);
    }
};
myForm.submit = function () {
    function SetErrors(form, fields) {
        function ClearInputErrors(form) {
            $(form).children('input').removeClass('error');
        }
        function ProcessInputs(form, fields) {
            for (var i = 0; i < fields.length; i++) {
                $(form).children('input[name="' + fields[i] + '"]').addClass('error');
            }
        }

        ClearInputErrors(form);
        ProcessInputs(form, fields);
    }
    function SetSubmitButtonActiveState(state) {
        if (state) {
            $('#submitButton').removeAttribute('disabled').removeClass('inactive');
        } else {
            $('#submitButton').attr('disabled', 'disabled').addClass('inactive');
        }
    }
    function ClearResultContainer() {
        $("#resultContainer").empty().removeClass('success').removeClass('error').removeClass('progress');
    }
    function PerformRequest(form) {
        return $.ajax({
            url : form.action,
            type : form.method,
            dataType : "json"
        });
    }
    function ProcessRequestResponse(response) {
        response.done(function (json) {
            var resultContainer = $('#resultContainer');

            resultContainer.addClass(json.status);
            switch (json.status) {
                case 'success':
                    resultContainer.text('Success');
                    break;
                case 'error':
                    resultContainer.text(json.reason);
                    break;
                case 'progress':
                    setTimeout(ProcessRequestResponse, json.timeout, PerformRequest(myForm));
            }
        })
    }

    var validationResult = this.validate();
    SetErrors(this, validationResult.errorFields);
    if (validationResult.isValid) {
        SetSubmitButtonActiveState(false);
        ClearResultContainer();
        ProcessRequestResponse(PerformRequest(myForm))
    } else {
    }
};
