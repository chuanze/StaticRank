        var data = null;
        var myScroll,
            pullDownEl, pullDownOffset,
            pullUpEl, pullUpOffset,
            pageCount = 30, //设置每页的数
            pageIndex = 0,
            topIndex = 0;
        // Handlebars.registerHelper('SortIcon', function() {
        //     var str = "↓";
        //     if (this.sort == 1)
        //         str = "↑";
        //     return new Handlebars.SafeString(str);
        // });
        Handlebars.registerHelper('rankimg', function(option) {
            var data = option.data;
            var str = "";
            switch (this.visitindex) {
                case "1":
                    str = '<img class="divm img-responsive" src="/images/findex.png" style="max-width: 86%;" />';
                    break;
                case "2":
                    str = '<img class="divm img-responsive" src="/images/sindex.png" style="max-width: 86%;" />';
                    break;
                case "3":
                    str = '<img class="divm img-responsive" src="/images/tindex.png" style="max-width: 86%;" />';
                    break;
                default:
                    str = "<h2>" + this.visitindex + "</h2>";
                    break;
            }
            return new Handlebars.SafeString(str);
        });
        Handlebars.registerHelper('percent', function(option) {
            var pc = 0.00;
            pc = this.sales / this.kpi * 100;
            return pc + "%";
        });
        Handlebars.registerHelper('logourl', function(option) {
            if (this.logourl == "")
                return "/images/tx.jpg";
            else
                return this.logourl;
        });
        Handlebars.registerHelper('mystyle', function(option) {
            if (this.username == '我')
                return "yellow";
            else
                return "";
        });
        //下拉刷新
        function pullDownAction() {
            console.log("pullDownAction");
            setTimeout(function() { // <-- Simulate network congestion, remove setTimeout from production!
                pageIndex = 1;
                var _url = "",
                    _forwhat = "";
                switch (topIndex) {
                    case 0:
                        _url = "/api/sfa/datasource/queryResultForMobile";
                        _forwhat = "#forday";
                        break;
                    case 1:
                        _url = "/api/sfa/datasource/queryResultForMobile";
                        _forwhat = "#forday";
                        break;
                    case 2:
                        _url = "/api/sfa/datasource/queryResultForMobile";
                        _forwhat = "#formonth";
                        break;
                }
                load_data(_url, topIndex, _forwhat);
            }, 1000); // <-- Simulate network congestion, remove setTimeout from production!
        }
        //上拉加载更多
        function pullUpAction() {
            var params = param_data("6b928500-350d-4d0a-832a-26e80bba4cdb", String(topIndex), String(pageIndex));
            // params.sessionid = "61c324e4-b80f-42e7-bae4-b47b907d5731";
            // params.enterprisenumber = "1008637";
            // params.usernumber = "631877";
            // params.params.usernumber = "631877";
            setTimeout(function() { // <-- Simulate network congestion, remove setTimeout from production!
                var _url = "",
                    _forwhat = "";
                switch (topIndex) {
                    case 0:
                        _url = "/api/sfa/datasource/queryResultForMobile";
                        _forwhat = "#forday";
                        break;
                    case 1:
                        _url = "/api/sfa/datasource/queryResultForMobile";
                        _forwhat = "#forday";
                        break;
                    case 2:
                        _url = "/api/sfa/datasource/queryResultForMobile";
                        _forwhat = "#formonth";
                        break;
                }
                $.ajax({
                    url: _url,
                    type: "post",
                    contentType: "application/json",
                    data: JSON.stringify(params),
                    async: true,
                    success: function(json) {
                        if (json.error_msg != undefined) {
                            $("#scroller").html("<span style='color:red;'>" + json.error_msg + "</span>");
                            return;
                        }
                        if (json.response_params.length < pageCount) {
                            $("#pullUp").hide();
                        } else {
                            $("#pullUp").show();
                        }
                        var upTemplate = Handlebars.compile($(_forwhat).html());
                        $("#main").append(upTemplate(json));
                        if (json.response_params.length > 0)
                            pageIndex++;
                        myScroll.refresh(); // Remember to refresh when contents are loaded (ie: on ajax completion)
                    },
                    error: function(XmlHttpRequest, textStatus, errorThrown) {
                        $(_forwhat).html("<span style='color:red;'>" + XmlHttpRequest.responseJSON.error_msg + "</span>");
                        $("#pullUp").hide();
                        alert("操作失败，请重试:" + XmlHttpRequest.responseText);
                    }
                });
            }, 1000); // <-- Simulate network congestion, remove setTimeout from production!
        }

        function loaded() {
            console.log("onload");
            pullDownEl = document.getElementById('pullDown');
            pullDownOffset = pullDownEl.offsetHeight;
            pullUpEl = document.getElementById('pullUp');
            pullUpOffset = pullUpEl.offsetHeight;

            myScroll = new iScroll('wrapper', {
                useTransition: true,
                topOffset: pullDownOffset,
                vScrollbar: false,
                onRefresh: function() {
                    if (pullDownEl.className.match('loading')) {
                        pullDownEl.className = '';
                        pullDownEl.querySelector('.pullDownLabel').innerHTML = '下拉刷新...';
                    } else if (pullUpEl.className.match('loading')) {
                        pullUpEl.className = '';
                        pullUpEl.querySelector('.pullUpLabel').innerHTML = '上拉加载更多...';
                    }
                },
                onScrollMove: function() {
                    if (this.y > 5 && !pullDownEl.className.match('flip')) {
                        pullDownEl.className = 'flip';
                        pullDownEl.querySelector('.pullDownLabel').innerHTML = '松手刷新...';
                        this.minScrollY = 0;
                    } else if (this.y < 5 && pullDownEl.className.match('flip')) {
                        pullDownEl.className = '';
                        pullDownEl.querySelector('.pullDownLabel').innerHTML = '下拉刷新加载..';
                        this.minScrollY = -pullDownOffset;
                    } else if (this.y < (this.maxScrollY - 5) && !pullUpEl.className.match('flip')) {
                        pullUpEl.className = 'flip';
                        pullUpEl.querySelector('.pullUpLabel').innerHTML = '松手加载更多...';
                        this.maxScrollY = this.maxScrollY;
                    } else if (this.y > (this.maxScrollY + 5) && pullUpEl.className.match('flip')) {
                        pullUpEl.className = '';
                        pullUpEl.querySelector('.pullUpLabel').innerHTML = '上拉加载更多...';
                        this.maxScrollY = pullUpOffset;
                    }
                },
                onScrollEnd: function() {
                    if (pullDownEl.className.match('flip')) {
                        pullDownEl.className = 'loading';
                        pullDownEl.querySelector('.pullDownLabel').innerHTML = '加载刷新...';
                        pullDownAction(); // Execute custom function (ajax call?)
                    } else if (pullUpEl.className.match('flip')) {
                        pullUpEl.className = 'loading';
                        pullUpEl.querySelector('.pullUpLabel').innerHTML = '加载更多...';
                        pullUpAction(); // Execute custom function (ajax call?)
                    }
                }
            });

            setTimeout(function() {
                var containerH = document.getElementById("head");
                document.getElementById('wrapper').style.left = '0';
                document.getElementById('wrapper').style.top = containerH.offsetHeight + 'px';
                myScroll.refresh();
            }, 800);
        }

        document.addEventListener('touchmove', function(e) {
            e.preventDefault();
        }, false);

        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(loaded, 200);
        }, false);
        $(function() {
            // var topparam = '{"datasourceid": "b32f7e50-b03d-48f9-bdd1-e8e8da1c5c63","sessionid": "61c324e4-b80f-42e7-bae4-b47b907d5731","enterprisenumber": "1008637","usernumber": "631877","params": {"usernumber": "631877","RankType": "0","pageIndex": "1","CountOrNot": "1"}}';
            var paramtop = param_data("6b928500-350d-4d0a-832a-26e80bba4cdb", "3", "1");
            // paramtop.sessionid = "61c324e4-b80f-42e7-bae4-b47b907d5731";
            // paramtop.enterprisenumber = "1008637";
            // paramtop.usernumber = "631877";
            // paramtop.params.usernumber = "631877";
            var params = param_data("6b928500-350d-4d0a-832a-26e80bba4cdb", "0", "1");
            // params.sessionid = "61c324e4-b80f-42e7-bae4-b47b907d5731";
            // params.enterprisenumber = "1008637";
            // params.usernumber = "631877";
            // params.params.usernumber = "631877";
            $.ajax({
                url: "/api/sfa/datasource/queryResultForMobile",
                type: "post",
                contentType: "application/json",
                data: JSON.stringify(paramtop),
                async: true,
                success: function(e, a, b) {
                    if (e.error_msg != undefined) {
                        $("#top").html("<span style='color:red;'>" + e.error_msg + "</span>");
                        return;
                    }

                    var TopTemplate = Handlebars.compile($("#ranktop").html());
                    $("#top").html("").append(TopTemplate(e.response_params[0]));
                    // console.log('success %O', e);
                },
                error: function(XmlHttpRequest, textStatus, errorThrown) {
                    $("#top").html("<span style='color:red;'>" + XmlHttpRequest.responseJSON.error_msg + "</span>");
                    console.log("操作失败，请重试:" + XmlHttpRequest.responseText);
                }
            });
            $.ajax({
                url: "/api/sfa/datasource/queryResultForMobile",
                type: "post",
                contentType: "application/json",
                data: JSON.stringify(params),
                async: true,
                success: function(e, a, b) {
                    if (e.error_msg != undefined) {
                        $("#scroller").html("<span style='color:red;'>" + e.error_msg + "</span>");
                        return;
                    }
                    if (e.response_params.length < pageCount) {
                        $("#pullUp").hide();
                    } else {
                        $("#pullUp").show();
                    }
                    var myTemplate = Handlebars.compile($("#forday").html());
                    $("#main").html("").append(myTemplate(e));
                    if (e.response_params.length > 0)
                        pageIndex = 2;
                    // console.log('success %O', e);

                },
                error: function(XmlHttpRequest, textStatus, errorThrown) {
                    $("#forday").html("<span style='color:red;'>" + XmlHttpRequest.responseJSON.error_msg + "</span>");
                    $("#pullUp").hide();
                    console.log("操作失败，请重试:" + XmlHttpRequest.responseText);
                }
            });
        });
        //点击事件
        function event_click(e) {
            pageIndex = 1;
            switch (e) {
                case 0:
                    console.log("今日排行");
                    topIndex = 0;
                    $("#topL").addClass("bw");
                    $("#topL").siblings().removeClass("bw");
                    load_data("/api/sfa/datasource/queryResultForMobile", "0", "#forday");
                    break;
                case 1:
                    console.log("昨日排行");
                    topIndex = 1;
                    $("#topR").addClass("bw");
                    $("#topR").siblings().removeClass("bw");
                    load_data("/api/sfa/datasource/queryResultForMobile", "1", "#forday");
                    break;
                default:
                    console.log("点击参数出错！");
                    break;
            }
        }
        //点击事件加载数据函数
        function load_data(_url, _querytype, _forwhat) {
            var dataparam = param_data("6b928500-350d-4d0a-832a-26e80bba4cdb", String(_querytype), String(pageIndex));
            // dataparam.sessionid = "61c324e4-b80f-42e7-bae4-b47b907d5731";
            // dataparam.enterprisenumber = "1008637";
            // dataparam.usernumber = "631877";
            // dataparam.params.usernumber = "631877";
            console.log("dataparam %O", dataparam);
            $.ajax({
                url: _url,
                type: "post",
                contentType: "application/json",
                // dataType: "json",
                data: JSON.stringify(dataparam),
                async: true,
                success: function(e, a, b) {
                    if (e.error_msg != undefined) {
                        $(_forwhat).html("<span style='color:red;'>" + e.error_msg + "</span>");
                        return;
                    }
                    if (e.response_params.length < pageCount || e.response_params == 0) {
                        $("#pullUp").hide();
                    } else {
                        $("#pullUp").show();
                    }
                    if (e.response_params == 0)
                        $(_forwhat).html("<span style='color:red;'>没有如何记录！</span>");
                    var myTemplate = Handlebars.compile($(_forwhat).html());
                    $("#main").hide();
                    $("#main").html("").append(myTemplate(e));
                    $("#main").fadeIn("slow");
                    if (e.response_params.length > 0)
                        pageIndex++;
                    myScroll.refresh();
                },
                error: function(XmlHttpRequest, textStatus, errorThrown) {
                    $(_forwhat).html("<span style='color:red;'>" + XmlHttpRequest.responseJSON.error_msg + "</span>");
                    $("#pullUp").hide();
                    alert("操作失败，请重试:" + XmlHttpRequest.responseText);
                }
            });
        }
        //获取url参数
        function GetQueryString(name) {
            var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
            var r = window.location.search.substr(1).match(reg);
            if (r != null) return unescape(r[2]);
            return null;
        }

        function param_data(_datasourceid, _querytype, _currentPage) {
            var _enterpriseid = GetQueryString("enterprisenumber");
            var _usernumber = GetQueryString("usernumber");
            var sessionid = GetQueryString("sessionid");
            var paramdata = {
                "datasourceid": _datasourceid,
                "sessionid": sessionid,
                "enterprisenumber": _enterpriseid,
                "usernumber": _usernumber,
                "params": {
                    "usernumber": _usernumber,
                    "querytype": _querytype,
                    "currentPage": _currentPage,
                    "pageSize": pageCount
                }
            };
            return paramdata;
        }
