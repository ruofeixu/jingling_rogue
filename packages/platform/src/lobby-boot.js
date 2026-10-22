(function () {
  var TITLE = "契灵志怪";
  var START = "新的旅途";
  var api = typeof wx !== "undefined" ? wx : typeof tt !== "undefined" ? tt : null;
  var PAPER = "rgb(232,244,252)";
  var INK = "rgb(61,50,40)";
  var ACCENT = "rgb(255,138,74)";

  function fillRound(ctx, x, y, w, h, r) {
    if (typeof ctx.roundRect === "function") {
      ctx.beginPath();
      ctx.roundRect(x, y, w, h, r);
      ctx.fill();
      return;
    }
    ctx.fillRect(x, y, w, h);
  }

  function paintLobby(ctx, w, h) {
    ctx.fillStyle = PAPER;
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = INK;
    ctx.textAlign = "center";
    ctx.font = "bold 38px sans-serif";
    ctx.fillText(TITLE, w / 2, h * 0.28);
    var bw = Math.min(280, w * 0.62);
    var bh = 56;
    var bx = (w - bw) / 2;
    var by = h * 0.46;
    ctx.fillStyle = ACCENT;
    fillRound(ctx, bx, by, bw, bh, 16);
    ctx.fillStyle = INK;
    ctx.font = "26px sans-serif";
    ctx.fillText(START, w / 2, by + 38);
  }

  function bootCanvas() {
    if (!api || !api.createCanvas) {
      return;
    }
    var canvas = api.createCanvas();
    var info = api.getSystemInfoSync ? api.getSystemInfoSync() : { screenWidth: 375, screenHeight: 667 };
    var w = info.screenWidth || 375;
    var h = info.screenHeight || 667;
    canvas.width = w;
    canvas.height = h;
    var ctx = canvas.getContext("2d");
    if (!ctx) {
      return;
    }
    paintLobby(ctx, w, h);
    if (api.onTouchStart) {
      api.onTouchStart(function () {
        ctx.fillStyle = PAPER;
        ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = INK;
        ctx.textAlign = "center";
        ctx.font = "30px sans-serif";
        ctx.fillText("选模式", w / 2, h * 0.4);
      });
    }
  }

  bootCanvas();
  if (api && api.login) {
    api.login({
      success: function (res) {
        console.log("[jingling] login", res.code);
      },
      fail: function () {
        console.log("[jingling] login skipped");
      },
    });
  }
})();
