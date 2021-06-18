module.exports = {
    activation: function (token, email, hash){
        return "<div style='background: #615dfa;padding: 3em;width: 65%;margin: 0 auto;text-align: center;'>\n" +
            "    <a href='https://psybox-new.herokuapp.com'><img style='max-width: 200px;' src='https://i.imgur.com/QtqPVAE.png'/></a>\n" +
            "    <div style='background: white;padding: 2em;width: 65%;margin: 1em auto;border-radius: 20px;display: grid;'>\n" +
            "        <img src='https://i.imgur.com/Fds2Jq4.png' style='width: 50%;margin: 0 auto;'/>\n" +
            "        <h2 style='width: 100%;'>Ευχαριστούμε για την εγγραφή σου!</h2>\n" +
            "        <p style='width: 100%;'>Έχετε εγγραφεί επιτυχώς αλλά χρειάζεται να επιβεβαιώσετε το λογαριασμό σας! Πατήστε στο κουμπί παρακάτω για ενεργοποίηση.</p>\n" +
            "        <a href='https://psybox-new.herokuapp.com/verify?token="+ token +"&email="+ email +"&hash="+ hash +"' style='background: #615dfa;color: white;text-decoration: none;padding: 10px;border-radius: 10px;width: 50%;box-shadow: 1px 1px 5px 0px #00000040;margin: 2em auto;'>Επιβεβαίωση λογαριασμού</a>\n" +
            "    </div>\n" +
            "</div>";
    },
    forgotPassword: function (link) {
        return "<div style='background: #615dfa;padding: 3em;width: 65%;margin: 0 auto;text-align: center;'>\n" +
            "    <a href='https://psybox-new.herokuapp.com'><img style='max-width: 200px;' src='https://i.imgur.com/HTxlNWx.png'/></a>\n" +
            "    <div style='background: white;padding: 2em;width: 65%;margin: 1em auto;border-radius: 20px;display: grid;'>\n" +
            "        <img src='https://i.imgur.com/wp3L8w8.png' style='width: 70%;margin: 0 auto;'/>\n" +
            "        <h2 style='width: 100%;'>Επαναφορά κωδικού</h2>\n" +
            "<p>"+ link +"</p>"+
            "        <p style='width: 100%;'>Ξέχασες τον κωδικό σου; Μην ανησυχείς! Πάτησε στο παρακάτω κουμπί για την αλλαγή του.</p>\n" +
            "        <a href='"+ link +"' style='background: #615dfa;color: white;text-decoration: none;padding: 10px;border-radius: 10px;width: 50%;box-shadow: 1px 1px 5px 0px #00000040;margin: 2em auto;'>Αλλαγή κωδικού</a>\n" +
            "    </div>\n" +
            "</div>";
    },
}