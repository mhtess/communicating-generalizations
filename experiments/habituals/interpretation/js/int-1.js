function make_slides(f) {
  var slides = {};

  slides.i0 = slide({
     name : "i0",
     start: function() {
      exp.startT = Date.now();
      $(".total-num").html(exp.numTrials);
     }
  });

  slides.interpretation = slide({
    name: "interpretation",
    present : exp.stims,
    present_handle : function(stim) {
      // debugger;
      // console.log(stim)
      $("#n_times").val('')
      $("#interval").val('')
      $(".err").hide();

      this.startTime = Date.now();
      this.stim = stim

      $(".habitual").html('"' + stim.character.name  + ' ' + stim.habitual + '."');
      $(".question").html("How frequently do you think " + stim.character.name+ " <strong>" + stim.habitual + "</strong>?");

    },

    button : function() {

      var n_times = parseInt($("#n_times").val())
      var int = $("#interval").val()
      if (isNaN(n_times) || int == "") {
        $(".err").show();
      } else {
        this.log_responses();
        _stream.apply(this);
      }
    },

    log_responses : function() {
      var rt = Date.now() - this.startTime;

      var stimDetails = this.stim;
      var name = stimDetails.character.name;
      var gender = stimDetails.character.gender;
      var habit = stimDetails.habitual;
      var category = stimDetails.category;
      var n_times = parseInt($("#n_times").val())
      var int = $("#interval").val()
      var trialNum = exp.stimscopy.indexOf(this.stim) + 1;

      exp.data_trials.push({
        "trial_type" : "interpretation",
        "rt":rt,
        "trialNum":trialNum,
        "habitual":habit,
        "n_times": n_times,
        "interval": int,
        "characterName": name,
        "characterGender":gender,
        "category":category

      });
    }
  });

  slides.subj_info =  slide({
    name : "subj_info",
    submit : function(e){
      //if (e.preventDefault) e.preventDefault(); // I don't know what this means.
      exp.subj_data = _.extend(fingerprint.geo, {
        language : $("#language").val(),
        enjoyment : $("#enjoyment").val(),
        asses : $('input[name="assess"]:checked').val(),
        age : $("#age").val(),
        gender : $("#gender").val(),
        education : $("#education").val(),
        problems: $("#problems").val(),
        fairprice: $("#fairprice").val(),
        comments : $("#comments").val()
      });
      exp.go(); //use exp.go() if and only if there is no "present" data.
    }
  });

  slides.thanks = slide({
    name : "thanks",
    start : function() {
      exp.data= {
          "trials" : exp.data_trials,
          "catch_trials" : exp.catch_trials,
          "system" : exp.system,
          "condition" : exp.condition,
          "subject_information" : exp.subj_data,
          "time_in_minutes" : (Date.now() - exp.startT)/60000
      };
      setTimeout(function() {turk.submit(exp.data);}, 1000);
    }
  });

  return slides;
}

/// init ///
function init() {

  repeatWorker = false;
  (function(){
      var ut_id = "mht-habint-20170424";
      if (UTWorkerLimitReached(ut_id)) {
        $('.slide').empty();
        repeatWorker = true;
        alert("You have already completed the maximum number of HITs allowed by this requester. Please click 'Return HIT' to avoid any impact on your approval rating.");
      }
  })();

  exp.trials = [];
  exp.catch_trials = [];

  var bothGenders = [
  ];

  // debugger;
  var nBothGender = _.filter(stimuli,
    function(s){return _.contains(bothGenders,s.habitual)}
  ).length

  var shuffledMen = _.shuffle(maleCharacters)
  var someMen = shuffledMen.splice(0,nBothGender)

  var shuffledWomen = _.shuffle(femaleCharacters)
  var someWomen = shuffledWomen.splice(0,nBothGender)

  var allGenders = _.shuffle(_.flatten([shuffledMen, shuffledWomen]))
  var stimsWNames = []

  for(i=0; i<(stimuli.length); i++){
    var s = stimuli[i];
    if (_.contains(bothGenders,s.habitual)) {
      stimsWNames.push(_.extend(s, {character: someMen.pop()}))
      stimsWNames.push(_.extend(s, {character: someWomen.pop()}))
    } else {
      stimsWNames.push(_.extend(s, {character: allGenders.pop()}))
    }
  }

  // var stimsWNames =  _.flatten(_.map(stimuli, function(s){
  //   var newObj = jQuery.extend(true, {}, s);
  //   return !(_.contains(bothGenders,s.habitual)) ?
  //   _.extend(s, {character: allGenders.pop()}) :
  //     [_.extend(s, {character: someMen.pop()}),
  //     _.extend(newObj, {character: someWomen.pop()})]
  // }), true)

  console.log(stimsWNames)
  exp.stims = _.shuffle(stimsWNames)
  exp.stimscopy = exp.stims.slice(0);

  exp.numTrials = exp.stims.length;

  exp.system = {
      Browser : BrowserDetect.browser,
      OS : BrowserDetect.OS,
      screenH: screen.height,
      screenUH: exp.height,
      screenW: screen.width,
      screenUW: exp.width
    };
  //blocks of the experiment:
  exp.structure=[
    "i0",
    "interpretation",
    'subj_info',
    'thanks'
  ];

  exp.data_trials = [];
  //make corresponding slides:
  exp.slides = make_slides(exp);

  exp.nQs = utils.get_exp_length(); //this does not work if there are stacks of stims (but does work for an experiment with this structure)
                    //relies on structure and slides being defined

  $('.slide').hide(); //hide everything

  //make sure turkers have accepted HIT (or you're not in mturk)
  $("#start_button").click(function() {
    if (turk.previewMode) {
      $("#mustaccept").show();
    } else {
      $("#start_button").click(function() {$("#mustaccept").show();});
      exp.go();
    }
  });

  exp.go(); //show first slide
}
