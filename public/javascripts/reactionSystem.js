$(".react-list li a").click(function () {
    var post_id = $(this).attr("data-postid");
    var reaction = $(this).attr("data-reaction");
    var cur_reaction = $("#postid_" + post_id).attr("data-current-reaction");
    var totalLikes = parseInt($("#reactions_count_" + post_id).text());

    if (cur_reaction == $(this).attr("data-reaction")) {
        //unlike
        $.ajax({
            url: '/community/deleteReaction',
            method: "POST",
            data: {postid: post_id, type: reaction},
            success: function (data) {
                if (data.status == "success") {}
            }
        })
        $("#reactions_count_" + post_id).text(totalLikes - 1);
        $("#postid_" + post_id + " span").text("React!");
        $("#postid_" + post_id + " img").attr("src", "/media/reactions/Wink.svg");
        $("#postid_" + post_id).removeClass("reacted");
        $("#postid_" + post_id).attr("data-current-reaction", "");
        $("#postid_" + post_id).css("background", "none");
    } else {
        //like
        if (cur_reaction == "" || typeof (cur_reaction) == "undefined") {
            $("#reactions_count_" + post_id).text(totalLikes + 1);
        }
        $("#postid_" + post_id + " span").text(reaction + "!");
        $("#postid_" + post_id + " img").attr("src", "/media/reactions/" + reaction + ".svg");
        $("#postid_" + post_id).addClass("reacted");
        $("#postid_" + post_id).attr("data-current-reaction", reaction);
        $("#postid_" + post_id).css("background", 'var(--'+ reaction +'-color)');
        $.ajax({
            url: '/community/createReaction',
            method: "POST",
            data: {postid: post_id, type: reaction},
            success: function (data) {
                if (data.status == "success") {}
            }
        })
    }
});