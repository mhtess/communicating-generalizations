function make_slides(f) {
  var slides = {};

  slides.i0 = slide({
     name : "i0",
     start: function() {
      $("#n_trials").html(exp.n_trials);
      exp.startT = Date.now();
     }
  });

  slides.instructions = slide({
    name : "instructions",
    button : function() {
      exp.go(); //use exp.go() if and only if there is no "present" data.
    }
  });


  slides.generateNames = slide({
    name: "generateNames",
    start: function() {
      this.counter = 1;
      $(".err").hide();

      var newTextBoxDiv = $(document.createElement('div'))
           .attr("id", 'TextBoxDiv' + this.counter);
      newTextBoxDiv.after().html('<label>Name #'+ this.counter + ' : </label>' +
            '<input type="text" name="textbox' + this.counter +
            '" id="textbox' + this.counter + '" value="" >');

      newTextBoxDiv.appendTo("#nameTable");
      this.counter++;

    },
    button : function() {
      if (this.counter > exp.n_friends) {
        for(i=1; i<this.counter; i++){
          exp.names.push(
            $('#textbox' + i).val()
          )
        }
        exp.go(); //make sure this is at the *end*, after you log your data
      } else {
        var newTextBoxDiv = $(document.createElement('div'))
             .attr("id", 'TextBoxDiv' + this.counter);

        newTextBoxDiv.after().html('<label>Name #'+ this.counter + ' : </label>' +
              '<input type="text" name="textbox' + this.counter +
              '" id="textbox' + this.counter + '" value="" >');
        newTextBoxDiv.appendTo("#nameTable");
        this.counter++;
      }
    },
  });

  slides.priors = slide({
    name: "priors",

    present: exp.stimuli,

    present_handle : function(stim) {
      this.startTime = Date.now()
      this.stim =  stim;
      this.trialNum = exp.stimscopy.indexOf(stim);
      $("#tableGenerator").html('<table id="tableGenerator"> </table>');

      $(".prompt").html(
        "For each of the following people that you know, how often does he or she <strong>" + stim.present + "</strong>?<br><br>"
      )


      // create response table
      for(i=0; i<exp.names.length; i++){
        var newRow = $(document.createElement('tr'))
             .attr("id", 'row' + i);

        // newRow.append( $("<td id=nameCol"+i+">").text(exp.names[i] +
        // " " + stim.habitual + " "));

        var freqBox = $(document.createElement('td'))
             .attr("id", 'freqbox' + i);

        freqBox.after().html(exp.names[i] +
        " " + stim.habitual + " " +
        '<input type="text" maxlength="3" size="3" tabindex="'+(i+1) +'"'+
              'id="freqbox_response' + i + '" value="" > times per </input>' +
              ' <select id="interval'+i+'">'+
              '<label><option value="" ></option></label>'+
                '<label><option value="week" >week</option></label>'+
                  '<label><option value="month">month</option></label>'+
                  '<label><option value="year">year</option></label>'+
                  '<label><option value="5 years">5 years</option></label>'+
               '</select>');

        newRow.append(freqBox)

        newRow.appendTo("#tableGenerator");
        $("#interval"+i).val('')
      }

      // give option to change all intervals at once
      var globalInterval = $(document.createElement('div'))
           .attr("id", 'globalInterval');
      globalInterval.after().html('<br>Set time window for all responses: <select id="global_setting">'+
      '<label><option value="" ></option></label>'+
        '<label><option value="week" >week</option></label>'+
          '<label><option value="month">month</option></label>'+
          '<label><option value="year">year</option></label>'+
          '<label><option value="5 years">5 years</option></label>'+
       '</select>')
       globalInterval.appendTo("#tableGenerator")
       $("#global_setting").val('')



      // if participant touches global option, change all others
      $( "#global_setting" ).change(function() {
        for(i=0; i<exp.names.length; i++){
          $("#interval"+i).val( $("#global_setting").val())
        }
      });


      $(".err").hide();

    },

    button : function() {

      for(i=0; i<exp.names.length; i++){
        exp.data_trials.push({
          action: this.stim.habitual,
          person: exp.names[i],
          n_times: $("#freqbox_response" + i).val(),
          interval: $("#interval" + i).val()
        })
      }

      // responses = [$("#text_response_a").val(),
      //              $("#text_response_b").val(),
      //               $("#n_people_a").val(),
      //                $("#n_people_b").val()]
      // if (_.contains(responses, ""))  {
      //   $(".err").show();
      // } else {
      //   this.rt = Date.now() - this.startTime;
      //   this.log_responses();
        _stream.apply(this);
      // }
    },

    // log_responses : function() {
    //   var m = exp.womenFirst ? "b" : "a"
    //   var f = exp.womenFirst ? "a" : "b"
    //   var timeDictionary = {
    //     "week":7,
    //     "month":30,
    //     "year":365,
    //     "5 years":1825
    //   }
    //   exp.data_trials.push({
    //     "trial_type" : "twostep_elicitation",
    //     "trial_num": this.trialNum+1,
    //     "item": this.stim.habitual,
    //     "category": this.stim.category,
    //     "nPersons_women" :  $("#n_people_"+f).val(),
    //     "nPersons_men" : $("#n_people_"+m).val(),
    //     "comparisonNum_women": $("#comparison_"+f).val(),
    //     "comparisonNum_men" : $("#comparison_"+m).val(),
    //     "nInstances_women" : $("#text_response_"+f).val(),
    //     "nInstances_men" : $("#text_response_"+m).val(),
    //     "comparisonTime_women" : $("#frequency_"+f).val(),
    //     "comparisonTime_men" : $("#frequency_"+m).val(),
    //     "effectiveExistence_women" : $("#n_people_"+f).val() / $("#comparison_"+f).val(),
    //     "effectiveExistence_men" : $("#n_people_"+m).val() / $("#comparison_"+m).val(),
    //     "effectiveDayWait_women": timeDictionary[$("#frequency_"+f).val()] / $("#text_response_"+f).val(),
    //     "effectiveDayWait_men": timeDictionary[$("#frequency_"+m).val()] / $("#text_response_"+m).val(),
    //     "rt":this.rt
    //   });
    // }
  });

  slides.subj_info =  slide({
    name : "subj_info",
    submit : function(e){
      //if (e.preventDefault) e.preventDefault(); // I don't know what this means.
      exp.subj_data = {
        language : $("#language").val(),
        enjoyment : $("#enjoyment").val(),
        asses : $('input[name="assess"]:checked').val(),
        age : $("#age").val(),
        gender : $("#gender").val(),
        education : $("#education").val(),
        problems: $("#problems").val(),
        fairprice: $("#fairprice").val(),
        comments : $("#comments").val()
      };
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
      var ut_id = "mht-hab-priors-20151221a";
      if (UTWorkerLimitReached(ut_id)) {
        $('.slide').empty();
        repeatWorker = true;
        alert("You have already completed the maximum number of HITs allowed by this requester. Please click 'Return HIT' to avoid any impact on your approval rating.");
      }
  })();

  exp.n_friends = 4;
  // exp.names = [];
  exp.names = ["John", "Mary", "Sally", "Jim"]
  exp.trials = [];
  exp.catch_trials = [];
  exp.stimuli = _.shuffle(stimuli);
  exp.n_trials = stimuli.length

  exp.womenFirst = _.sample([true, false])
  // debugger;
  exp.stimscopy = exp.stimuli.slice(0);

  // exp.condition = _.sample(["CONDITION 1", "condition 2"]); //can randomize between subject conditions here
  exp.system = {
      Browser : BrowserDetect.browser,
      OS : BrowserDetect.OS,
      screenH: screen.height,
      screenUH: exp.height,
      screenW: screen.width,
      screenUW: exp.width
    };
  //blocks of the experiment:
  exp.structure=["priors" ,
  // "i0", "instructions","catch", "single_trial", 'subj_info', 'thanks'
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
