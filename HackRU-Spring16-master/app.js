/**
 * @author Kevin Bohinski <bohinsk1@tcnj.edu>
 * @author Patrick Roderman <rodermp1@tcnj.edu>
 * @author Brett Ratner <ratnerb1@tcnj.edu>
 *
 * @version 1.0.0
 * @since 2016-4-16
 *
 * Project Name:  Command line bank account checker
 * Description:   Uses the CaptialOne API to allow someone
 *                to check basic info about their bank
 *                accounts via the command line.
 *
 * Filename:      /app.js
 * Description:   Main implementation file for program.
 * Last Modified: 2016-4-16
 */

var version = '1.0.0';

/* Bring in requirements */
var request = require('request');
var fs = require('fs');
var prompt = require('prompt');
var colors = require('colors');
var CAPITAL_ONE_API_KEY = require('./capitalone_api_key.json').CAPITAL_ONE_API_KEY;
var CAPITAL_ONE_API_URL = 'http://api.reimaginebanking.com/';
var customerInfo = {};
var BROKE_OR_NAW = 2000;
var youngmoney = "\n                                                                                \n                                      ddd-                                      \n                                     `MMM: :y                                   \n                                    `.MMM: :d                                   \n                            `|oydNMMMMMMMNmmNyo|-.      -:                      \n                         `odMMMMMMdyssMMMNMMMMMMMMMmmdmMy .y`                   \n                       `sMMMMMNs:  .:+MMM:`-odMMMMMMMMMo -m-                    \n                      -NMMMMMs` -yyo|:MMM: :y|:hMMMMMM+ :m.                     \n                     .NMMMMMo  sh.   `MMM: :d:so|MMMM+ -m.                      \n                     hMMMMMM  :m     `MMM: :d  `-:MMo -m.                       \n                     MMMMMMM. +h     `MMM: :d     sh .m.                        \n                    `MMMMMMMh``m:    `MMM: :d     `` h-                         \n                     NMMMMMMMm|`o+`  `MMM: :d                                   \n                     +MMMMMMMMMNy||- `MMM: :d                                   \n                      yMMMMMMMMMMMMNdhMMM|`:d                                   \n                       oMMMMMMMMMMMMMMMMMMMMNyo:.                               \n                        .sNMMMMMMMMMMMMMMMMMMMMMMNds:`                          \n                        so`-+ydMMMMMMMMMMMMMMMMMMMMMMMh:  .                     \n                         :yyo:` .:|oyhMMMMMMMMMMMMMMMMMMh..+.                   \n                            .|osyys+|-MMM||oymMMMMMMMMMMMN: s|                  \n                                  `-|oMMM. .-``:yNMMMMMMMMN. h|                 \n                                     `MMM. |doss+.sMMMMMMMMy -N                 \n                        |            `MMM. |y   -oo-NMMMMMMm  N:                \n                       +M- `o        `MMM. |y     `.:MMMMMMm  m|                \n                      :MMd  m+       `MMM. |y        NMMMMMs `M-                \n                     -NMMMy .m-      `MMM. |y        NMMMMN. od                 \n                    -NMMMMMd..h+     `MMM. |y       sMMMMN: -N.                 \n                   :NMMMMMMMMy-:s+`  `MMM. |y     .yMMMMd. |m-                  \n                  |MMMMMMMMMMMMms+o|.`MMM. |y  .|hMMMMd| `yh.                   \n                 +dy+|::|+oydmMMMMMMNmMMMyydNdNMMMMms- .sd:                     \n                  `-|+oo+|:-.  .-|osyhMMMNMMNmdyo|. .+hy:                       \n                  `o:-....-:+ossss+|-.MMM:    .-|ohhs|`                         \n                                  .-|oMMM: |mo+|:.                              \n                                     `MMM: |y                                   \n                                      hhh. |y                                   \n                                       .:::sy                                   \n                                        ::::.                                   \n                                                                                \n                                                                                ";
var cantstumpthetrump = "Yeah!";
fs.access('./customer_info.json', fs.R_OK, function (err) {
    if (err) {
        /* Cant access file */
        var input = true;
        while (input) {
            input = false;
            prompt.start();
            prompt.get(['CustomerID'], function (err, result) {
                if (result.CustomerID !== '' && result.CustomerID !== undefined) {
                    request.get(CAPITAL_ONE_API_URL + 'customers/' + result.CustomerID + '?key=' + CAPITAL_ONE_API_KEY, function (e, r, b) {
                        /* If no errors */
                        if (r.statusCode >= 200 && r.statusCode < 400 && !e) {
                            b = JSON.parse(b);
                            console.log('Hello, ' + b.first_name);
                            fs.writeFile('./customer_info.json', '{"id":"' + result.CustomerID + '"}', function (err) {
                                if (err) {
                                    console.log('Err: Could not write to file.');
                                    process.exit(1);
                                } else {
                                    console.log('Your information has been saved.');
                                    customerInfo = require('./customer_info.json');
                                    getAccountsAndProcessRequest();
                                }
                            });
                        } else {
                            console.log('Err: Bad API call - Customer.');
                            input = true;
                        }
                    });
                }
            });
        }
    } else {
        /* File availiable */
        customerInfo = require('./customer_info.json');
        getAccountsAndProcessRequest();
    }
});

function getAccountsAndProcessRequest() {
    request.get(CAPITAL_ONE_API_URL + 'customers/' + customerInfo.id + '/accounts?key=' + CAPITAL_ONE_API_KEY, function (e, r, b) {
        /* If no errors */
        if (r.statusCode >= 200 && r.statusCode < 400 && !e) {
            customerInfo.accounts = JSON.parse(b);
            processRequest();
        } else {
            console.log('Err: Bad API call - Accounts');
        }
    });
}

function processRequest() {
    var isEmpty = true;

    if (process.argv[2] === undefined) {
        var monies = 0;
        for (var i = 0; i < customerInfo.accounts.length; i++) {
            monies += customerInfo.accounts[i].balance;
        }
        if (monies > BROKE_OR_NAW) {
            for (var j = 0; j < 4; j++) {
                console.log(youngmoney.green);
            }
        } else {
        
                console.log(cantstumpthetrump.red);

        }
        return;
    } else {
        if(process.argv[2].toLowerCase() === "accounts" || process.argv[2].toLowerCase() === "bills" || process.argv[2].toLowerCase() === "deposits" ||
            process.argv[2].toLowerCase() === "purchases" || process.argv[2].toLowerCase() === "transfers" || process.argv[2].toLowerCase() === "withdrawals"){
            console.log('Attempting to check your ' + process.argv[2] + "...");
        }else{
            console.log(("The command : '" + process.argv[2] + "' is not recognized.").red);
            return;
        }


     }

    if (process.argv[2] === 'accounts') {
        for (var i = 0; i < customerInfo.accounts.length; i++) {
            console.log('  ' + customerInfo.accounts[i].nickname + ', ' + customerInfo.accounts[i].balance + ', ' + customerInfo.accounts[i]._id + ', ' + customerInfo.accounts[i].type)
            isEmpty = false;
        }
        if(isEmpty){
            console.log("There are no records available.");
        }
        return;
    }

    if (process.argv[2] === 'bills') {
        request.get(CAPITAL_ONE_API_URL + 'customers/' + customerInfo.id + '/bills?key=' + CAPITAL_ONE_API_KEY, function (e, r, b) {
            /* If no errors */
            if (r.statusCode >= 200 && r.statusCode < 400 && !e) {
                b = JSON.parse(b);
                for (var i = 0; i < b.length; i++) {
                    console.log('  ' + b[i]._id + ', ' + b[i].payee + ', ' + b[i].payment_amount);
                    isEmpty = false;
                }
                if(isEmpty){
                    console.log("There are no records available.");
                }
            } else {
                console.log('Err: Bad API call.');
            }
        });
        return;
    }

    if (process.argv[2] === 'deposits') {
        for (var j = 0; j < customerInfo.accounts.length; j++) {
            request.get(CAPITAL_ONE_API_URL + 'accounts/' + customerInfo.accounts[j]._id + '/deposits' + '?key=' + CAPITAL_ONE_API_KEY, function (e, r, b) {
                    /* If no errors */
                    if (r.statusCode >= 200 && r.statusCode < 400 && !e) {
                        b = JSON.parse(b);
                        for (var i = 0; i < b.length; i++) {
                            if (b[i] !== "undefined") {
                                console.log('  ' + b[i]._id + ', ' + b[i].transaction_date + ', ' + b[i].amount);
                            }
                            isEmpty = false;
                        }
                        if(isEmpty){
                            console.log("There are no records available.");
                        }
                    } else {
                        console.log(r.statusCode);
                        console.log('Err: Bad API call.');
                    }
                }
            );
        }
        return;
    }

    if (process.argv[2] === 'purchases') {
        for (var j = 0; j < customerInfo.accounts.length; j++) {
            request.get(CAPITAL_ONE_API_URL + 'accounts/' + customerInfo.accounts[j]._id + '/purchases' + '?key=' + CAPITAL_ONE_API_KEY, function (e, r, b) {
                /* If no errors */
                if (r.statusCode >= 200 && r.statusCode < 400 && !e) {
                    b = JSON.parse(b);
                    for (var i = 0; i < b.length; i++) {
                        if (b[i] !== "undefined") {
                            console.log("  Amount: " + b[i].amount, "Date: " + b[i].purchase_date);
                        }
                        isEmpty = false;
                    }
                    if(isEmpty){
                        console.log("There are no records available.");
                    }
                } else {
                    console.log(r.statusCode);
                    console.log('Err: Bad API call.');
                    }
                }
            );
        }
        return;
    }

    if (process.argv[2] === 'transfers') {
        for (var j = 0; j < customerInfo.accounts.length; j++) {
            request.get(CAPITAL_ONE_API_URL + 'accounts/' + customerInfo.accounts[j]._id + '/transfers' + '?key=' + CAPITAL_ONE_API_KEY, function (e, r, b) {
                /* If no errors */
                if (r.statusCode >= 200 && r.statusCode < 400 && !e) {
                    b = JSON.parse(b);
                    for (var i = 0; i < b.length; i++) {
                        if (b[i] !== "undefined") {
                            console.log('  ' + b[i]._id + ', ' + b[i].transaction_date + ', ' + b[i].amount);
                        }
                        isEmpty = false;
                    }
                    if(isEmpty){
                        console.log("There are no records available.");
                    }
                } else {
                    console.log(r.statusCode);
                    console.log('Err: Bad API call.');
                }
                }
            );
        }
        return;
    }

    if (process.argv[2] === 'withdrawals') {
        for (var j = 0; j < customerInfo.accounts.length; j++) {
            request.get(CAPITAL_ONE_API_URL + 'accounts/' + customerInfo.accounts[j]._id + '/withdrawals' + '?key=' + CAPITAL_ONE_API_KEY, function (e, r, b) {
                    /* If no errors */
                    if (r.statusCode >= 200 && r.statusCode < 400 && !e) {
                        b = JSON.parse(b);
                        for (var i = 0; i < b.length; i++) {
                            if (b[i] !== "undefined") {
                                console.log('  ' + b[i]._id + ', ' + b[i].transaction_date + ', ' + b[i].amount);
                            }
                            isEmpty = false;
                        }
                        if(isEmpty){
                            console.log("There are no records available.");
                        }
                    } else {
                        console.log(r.statusCode);
                        console.log('Err: Bad API call.');
                    }
                }
            );
        }
        return;
    }


}