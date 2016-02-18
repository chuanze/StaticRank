var currentcount = 0;
var emptyobject = { //如果是单数的时候填补
    "icon": "icon1.jpg",
    "honour": "日销亚军",
    "explain": "日销排名第2名",
    "count": "2",
    "add": "1"
};
$(function() {
    var params = param_data("7ce5d592-1972-4af6-9ad4-dbe6aab514f4");
    // params.sessionid = "61c324e4-b80f-42e7-bae4-b47b907d5731";
    // params.enterprisenumber = "1008637";
    // params.usernumber = "790501";
    // params.params.usernumber = "790501";
    Handlebars.registerHelper('nolr', function(option) {
        var data = option.data;
        if (currentcount != 0)
            currentcount = data.index;
        var str = "nor";
        if (data.index % 2 == 0)
            str = "nol";
        return new Handlebars.SafeString(str);
    });
    Handlebars.registerHelper('foradd', function(option) {
        var str = "";
        if (this.ifadd == 0)
            str = "divhide";
        return new Handlebars.SafeString(str);
    });
    $.ajax({
        url: "/api/sfa/datasource/queryResultForMobile",
        type: "post",
        contentType: "application/json",
        data: JSON.stringify(params),
        async: true,
        success: function(json) {
            // console.log("success %0",json);
            if (json.error_msg != undefined) {
                $("#myhonour").html("<span style='color:red;'>" + e.error_msg + "</span>");
                return;
            }
            if (json.response_params.length <= 0) {
                $("#myhonour").html("<span style='color:red;'>暂时没有任何数据！</span>");
                return;
            }
            console.log(json.response_params.length);
            var TopTemplate = Handlebars.compile($("#myhonour-template").html());
            $("#myhonour").html("").append(TopTemplate(json));
            if (json.response_params.length % 2 != 0) {
                var _str = ['            <div class="col-xs-6 col-sm-6 col-md-3 bsc nor">',
                    '                <div class="thumbnail table">',
                    '                    <div class="row">',
                    '                        <div class="col-xs-4 col-sm-4 tar pd10 bsc"><img class="icon divhide" src="images/findex.png"></div>',
                    '                        <div class="col-xs-8 col-sm-8 tal pd10 bsc"><span class="fw honour fonthide">全勤王</span>',
                    '                            <div class="grey explain fonthide">整月无迟到早退</div>',
                    '                            <div class="pd5"><span class="bf sort fonthide">9</span><span class="fw fonthide">次</span></div>',
                    '                        </div>',
                    '                    </div>',
                    '                </div>',
                    '            </div>'
                ].join("");
                $("#myhonour").append(_str);
            }
        },
        error: function(XmlHttpRequest, textStatus, errorThrown) {
            $("#myhonour").html("<span style='color:red;'>" + XmlHttpRequest.responseJSON.error_msg + "</span>");
            // alert("操作失败，请重试:" + XmlHttpRequest.responseText);
        }
    });

})

function GetQueryString(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
    var r = window.location.search.substr(1).match(reg);
    if (r != null) return unescape(r[2]);
    return null;
}

function param_data(_datasourceid) {
    var _enterpriseid = GetQueryString("enterprisenumber");
    var _usernumber = GetQueryString("usernumber");
    var sessionid = GetQueryString("sessionid");
    var paramdata = {
        "datasourceid": _datasourceid,
        "sessionid": sessionid,
        "enterprisenumber": _enterpriseid,
        "usernumber": _usernumber,
        "params": {
            "usernumber": _usernumber
        }
    };
    return paramdata;
}
