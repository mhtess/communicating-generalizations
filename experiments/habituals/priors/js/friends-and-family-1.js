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
    start: function() {
     $(".n_people").html(exp.n_friends);
   },
    button : function() {
      exp.go(); //use exp.go() if and only if there is no "present" data.
    }
  });


  slides.generateNames = slide({
    name: "generateNames",
    start: function() {
      this.counter = 1;
      $(".n_people").html(exp.n_friends);

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
      var response = $('#textbox' + (this.counter - 1) ).val();
      if (response == "") {
        $(".err").show();
      } else {
        $(".err").hide();
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
      this.allZeros = 1;
      this.hypothetical = 0;
      this.askDirect = 0;

      $("#tableGenerator").html('<table id="tableGenerator"> </table>');

      $(".prompt").html(
        "For each of the following people that you know, how often does he or she <strong>" + stim.present + "</strong>?<br><br>"
      )


      // create response table
      for(i=0; i<exp.names.length; i++){
        var newRow = $(document.createElement('tr'))
             .attr("id", 'row' + i);

        var freqBox = $(document.createElement('td'))
             .attr("id", 'freqbox' + i);

        freqBox.after().html("<strong>" + exp.names[i] + "</strong>"+
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
      var freqs = [], intervals = [];

      for(i=0; i<exp.names.length; i++){
        freqs.push($("#freqbox_response" + i).val())
        intervals.push($("#interval" + i).val())
      }
      // debugger;

      // check if all fields are filled
      if ( (intervals.indexOf("") == -1) && (freqs.indexOf("") == -1 ) ) {
        // check if all frequencies supplied are 0
        for(i = 0; i < freqs.length; ++i) {
          if(freqs[i] !== "0") {
            this.allZeros = 0;
            break;
          }
        }

        // if all frequencies are 0, ask about somebody they might know
        if (this.allZeros) {
          i = exp.names.length;

         var hypotheticalQuery = $(document.createElement('div'))
              .attr("id", 'hypothetical');

          var followUpQ = '<br>Do you know anybody who has '+ this.stim.past+' before? <br>'
          // var followUpQ = '<br>Imagine you meet a person who has '+ this.stim.past+' before. <br>How often do you think they '+this.stim.present + '?<br>'

          hypotheticalQuery.after().html(
            followUpQ +
            '<label><input type="radio"  name="knowAnybody" value="No"/>No</label>'+
            '<label><input type="radio"  name="knowAnybody" value="Yes"/>Yes</label>'
          )
          this.allZeros = 0;
          this.askDirect = 1;
          hypotheticalQuery.appendTo("#tableGenerator");

        } else if (this.askDirect){
          if ($('input[name="knowAnybody"]:checked').val()  == null) {
            $(".err").show();
          } else if ( $('input[name="knowAnybody"]:checked').val() === "Yes" ){
            $(".err").hide();

            if (this.hypothetical == 1) {
              if  (
                ($("#freqbox_response" + exp.names.length).val() != "") &&
                ($("#interval" + exp.names.length).val() != "")
              ) {
                this.log_responses();
                _stream.apply(this);
              } else {
                $(".err").show();
              }
            } else {
              i = exp.names.length;

              var hypotheticalQuery2 = $(document.createElement('div')).attr("id", 'hypothetical2');

              hypotheticalQuery2.after().html(
                '<br> How often do you think they '+ this.stim.present + '?<br>' +
              '<input type="text" maxlength="3" size="3" tabindex="'+(i+1) +'"'+
                    'id="freqbox_response' + i + '" value="" > times per </input>' +
                    ' <select id="interval'+i+'">'+
                    '<label><option value="" ></option></label>'+
                      '<label><option value="week" >week</option></label>'+
                        '<label><option value="month">month</option></label>'+
                        '<label><option value="year">year</option></label>'+
                        '<label><option value="5 years">5 years</option></label>'+
                     '</select>'
                   )

              $("#interval"+i).val('')
              this.hypothetical = 1;
              hypotheticalQuery2.appendTo("#tableGenerator");
            }
          } else {
          this.log_responses();
          _stream.apply(this);
        }
      } else { // if not all 0s
        this.log_responses();
        _stream.apply(this);
      }
    } else  {
        $(".err").show();
    }

    },
    log_responses : function() {
      for(i=0; i<exp.names.length; i++){
        exp.data_trials.push({
          action: this.stim.habitual,
          person: exp.names[i],
          n_times: $("#freqbox_response" + i).val(),
          interval: $("#interval" + i).val()
        })
      }
      if (this.hypothetical) {
        exp.data_trials.push({
          action: this.stim.habitual,
          person: "hypothetical",
          n_times: $("#freqbox_response" + exp.names.length).val(),
          interval: $("#interval" + exp.names.length).val()
        })
      }
    }

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

  exp.n_friends = 8;
  exp.names = [];
  // exp.names = ["John", "Mary", "Sally", "Jim"]
  exp.trials = [];
  exp.catch_trials = [];
  exp.stimuli = _.shuffle(stimuli);
  exp.n_trials = stimuli.length

  // exp.womenFirst = _.sample([true, false])
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
  exp.structure=[
    "i0",
    "instructions",
    "generateNames",
    "priors",
    "subj_info",
    "thanks"
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
