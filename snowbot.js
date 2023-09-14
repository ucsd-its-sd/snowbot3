const Discord = require('discord.js');

// Create new client instance and login.
const client = new Discord.Client({
	intents: [
		Discord.GatewayIntentBits.Guilds,
		Discord.GatewayIntentBits.GuildMessages,
		Discord.GatewayIntentBits.MessageContent,
		Discord.GatewayIntentBits.GuildMembers,
	],
});
const { token } = require('./config.json');
client.login(token);
client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
  console.log(`Watching ${client.users.cache.size} users!`)
});

//A collection of leads, discord IDs, and emotes associated
//Might wanna split to have emote ID
const leadCarrerDict = [{
    Name: "Aedan",
    EmoteN: ":ThatDawg:",
    EmoteID: "<:ThatDawg:1150857342968152211>",
    ID: '299020647198228480'
  },{
    Name: "Kevin",
    EmoteN: ":laoo:",
    EmoteID: '<:laoo:1088529626105647114>',
    ID: '419970850519777280'
  },{
    Name: "Ivan",
    EmoteN: ":concern:",
    EmoteID: '<:concern:1017133018390995005>',
    ID: '283414458590822401'
  },{
    Name: "Mingson",
    EmoteN: "🦧",
    EmoteID: '<:orangutan:266023244539232257>',
    ID: '266023244539232257'
  },{
    Name: "Bryce",
    EmoteN: ":patcase:",
    EmoteID: '<:patface:1151963202633093141>',
    ID: '147954160526950411'
  },{
    Name: "Kelly",
    EmoteN: ":petergasp:",
    EmoteID: '<:petergasp:1151961777756700773>',
    ID: '718326776165826580'
  },{
    Name: "Tae",
    EmoteN: ":bumis:",
    EmoteID: '<:bumis:916554784625025116>',
    ID: '687482247955218483'
  },{
    Name: "Vincent",
    EmoteN: ":bang:",
    EmoteID: '<:bang:1088606779748913292>',
    ID: '136447120658923520'
  },{
    Name: "Rolando",
    EmoteN: ":AAA:",
    EmoteID: '<:AAA:1035307742715461642>',
    ID: '96402723435446272'
  },{
    Name: "Lola",
    EmoteN: ":letsgoooooooooooooo:",
    EmoteID: '<:letsgoooooooooooooo:1151972456488259674>',
    ID: '472305444518494208'
  },{
    Name: "Robyn",
    EmoteN: ":partyrobyn:",
    EmoteID: '<:partyrobyn:1017136291374174311>',
    ID: '880110499512061964'
  },{
    Name: "Jenny",
    EmoteN: ":snorlax",
    EmoteID: '<:snorlax:784554135420272640>',
    ID: '491450429679468565'
  },{
    Name: "Steve",
    EmoteN: ":theclawww:",
    EmoteID: '<:theclawww:787259808326615060>',
    ID: '97838330716094464'
  }]

  //Kelly and Bryce Don't have emotes yet


var phoneList = [];
for(var i = 0; i < leadCarrerDict.length; i++){
  phoneList.push({name: leadCarrerDict[i][Emotes], value: "Dials" + leadCarrerDict[i][Name]})
}
phoneList.push({name: "@Steve",value: "@Steve dials Kermit 30% of the time."}),
phoneList.push({name: "@Jenny",value: "@Jenny dials Flame Elmo 17% of the time"})
phoneList.push({name: "@Robyn",value: "@Robyn dials Party Robyn 22% of the time"})

//0-10            Aedan                 Kevin                Ivan                 Mingson              Jeremy               Bryce                Kelly                Tae                  Vincent
const IDArray = ['299020647198228480','419970850519777280','283414458590822401','266023244539232257','298696268920913924','147954160526950411','718326776165826580','687482247955218483','136447120658923520',
//Rolando            Lola
'96402723435446272','472305444518494208'];

var RecentFires = [];

// Actually do stuff.
client.on('messageCreate', msg => {
  
  var index = msg.content.toLowerCase().indexOf("!cs");
  if (index >= 0 && !isNaN(msg.content.substring(3+index,10+index))){
    var args = msg.content.substring(1+index,10+index);
    //msg.channel.send('https://support.ucsd.edu/nav_to.do?uri=task.do?sysparm_query=number=' + args);
	  const csEmbed = new Discord.EmbedBuilder().setDescription('[Case ' + args.toUpperCase() + '](https://support.ucsd.edu/nav_to.do?uri=task.do?sysparm_query=number=' + args + ')');
	  msg.channel.send({embeds: [csEmbed]});
  }

  //commands with no input reading
  if (msg.content.includes("!")){
    //dumb commands collapsed in here
    //#region 
    if(msg.content.includes("!joke")){
      msg.channel.send('josh');
    }

    if(msg.content.includes("!ping")){
      msg.channel.send('pong');
    }
	  
    if(msg.content.includes("!ding")){
      msg.channel.send('dong');
    }
	  
    if(msg.content.includes("!aloha")){
      msg.channel.send('World class customer service!');
    }

    if(msg.content.includes("!sleep")){
      msg.channel.send('go to bed',{
        tts: true
      });
    }

    if(msg.content.includes("!sammy")){
      msg.channel.send('sigh');
    }

    if(msg.content.includes("!loudsammy")){
      msg.channel.send('sigh',{
        tts: true
      });
    }

    //BOB FIRED
    if(msg.content.includes("!fired")){
		  if(msg.author.id == "718538581421064232"){
			  msg.delete();
			  msg.channel.send('<@718538581421064232> FIRED'); //Ari firing
		  } 
      else{
      toFire = getRandomInt(0,10);
      msg.channel.send(`<@${IDArray[toFire]}> Fired`);
      RecentFires.push(IDArray[toFire]);
      console.log(RecentFires);
		  }
    }
    
    if(msg.content.includes("!hired")){
      if(RecentFires.length === 0){
        toHire = getRandomInt(0,10);
        msg.channel.send(`<@${IDArray[toHire]}> Fired!`);
        msg.channel.send(`<@${IDArray[toHire]}> And Rehired!`);
      }
      //Pull from recent fired
      else{
        //Moves RecentFires one to the left and saves the removed first element
        toHire = RecentFires.shift();
        console.log(toHire);
        msg.channel.send(`<@${toHire}> has been hired! All your shifts start at 6:45AM`);
      }
    }

    //nice one
    if(msg.content.toLowerCase().includes("!cscs")){
      msg.channel.send('delete the extra cs!');
    }

      
    //Sammy GIF
    if(msg.content.includes("!hyper")){
      msg.channel.send('https://cdn.discordapp.com/attachments/765777043639762948/775841239878074388/sammy.gif');
    }
      
    //BIRD
    if(msg.content.includes("!parrot")){
      msg.channel.send('https://media.discordapp.net/attachments/765777043639762948/784559806630330398/bird.gif');
    }

    //TOAD
    if(msg.content.includes("!toad")){
      msg.channel.send('https://cdn.discordapp.com/attachments/765777043639762948/784565365949857842/toad.gif');
    }

    //#endregion

    //Useful Stuff
    //#region 
    //FS
    if (msg.content.includes("!fs")||msg.content.includes('!fieldsupport')){
      msg.channel.send('https://cdn.discordapp.com/attachments/765777043639762948/784567793047699496/fs-map.png');
    }
	  
	  if (msg.content.toLowerCase().includes("!nato")){
      msg.channel.send('https://media.discordapp.net/attachments/765777043639762948/886307401106604123/GettyImages-1060490970-dcac66d9cda841638d49bc10f5dc1a8b.webp');
    }

    if(msg.content.includes("!phonebook")){
      msg.channel.send({ embeds: [phonebook] });
    }

    if(msg.content.includes("!help")){
      msg.channel.send({ embeds: [helpMenu] });
    }

    if(msg.content.includes("!ls")||msg.content.includes("!list")){
      msg.channel.send({ embeds: [cheatsheet] });
    }

    if(msg.content.includes("!snow")){
      var args = msg.content.substring(6+msg.content.indexOf("!snow"));
      msg.channel.send('https://support.ucsd.edu/nav_to.do?uri=task.do?sysparm_query=number=' + args);
    }
	  
	  if(msg.content.includes("!kb")){
      var args = msg.content.substring(4+msg.content.indexOf("!kb"));
		  var argsURL = encodeURI(args);
		  const kbResults = new Discord.EmbedBuilder().setDescription('[Knowledge Base Search Results for ' + args + '](https://support.ucsd.edu/its?id=search&spa=1&q=' + argsURL + ")");
		  msg.channel.send({embeds: [kbResults]});
    }
	  
	  if(msg.content.includes("!collab")){
      var args = msg.content.substring(8+msg.content.indexOf("!collab"));
		  var argsPlus = args.split(' ').join('+');;
		  const collabResults = new Discord.EmbedBuilder().setDescription('[Collab Search Results for ' + args + '](https://collab.ucsd.edu/dosearchsite.action?cql=siteSearch+~+%22' + argsPlus +'%22+and+space+%3D+%22CKB%22)');
		  msg.channel.send({embeds: [collabResults]});
    }
	  
	  if(msg.content.includes("!p ")){
      var args = msg.content.substring(3+msg.content.indexOf("!p "));
		  if(args.indexOf(" ") >= 0){
			  var args = args.substring(0,args.indexOf(" "));
		  }
		  const mailupdResults = new Discord.EmbedBuilder().setDescription('[MailUPD page for ' + args + '](https://mailupd.ucsd.edu/view?id=' + args + ')');
		  msg.channel.send({embeds: [mailupdResults]});
    }
  }

  //includes : needed for customer emotes
  if(msg.content.includes(":")){
    for(var i = 0; i < leadCarrerDict.length; i++){
      if(msg.content.includes(leadCarrerDict[i][EmoteN])){
        msg.channel.send(`<@${leadCarrerDict[i][ID]}>`);
        break;
      }
    }
    /*//custom emoji commands collapsed here
    //#region 

    //Jenny
    if(msg.content.includes(":snorlax:")){
      msg.channel.send("<@491450429679468565>");
    }


    //Jim
    else if(msg.content.includes(":bandanadee:")){
      msg.channel.send("<@!354474386213830656>");
    }

    //Robyn
    else if(msg.content.includes(":partyrobyn:")){
      msg.channel.send("<@880110499512061964>");
    }
	
	  //Ivan
    else if(msg.content.includes(":concern:")){
      msg.channel.send("<@283414458590822401>");
    }
	
	  //Steven
    else if(msg.content.includes(":orang:")){
      msg.channel.send("<@138143243559895040>");
    }
	
	
	  //Rolando
    else if(msg.content.includes(":AAA:")){
      msg.channel.send("<@96402723435446272>");
    }	
	  
  
    //Aedan
    else if(msg.content.includes(":ThatDawg:")){
      msg.channel.send("<@299020647198228480>");
    }

    //Dylan
    else if(msg.content.includes(":fingergunsleft:")){
      msg.channel.send("<@339622598407225354>")
    }

    //Ariana
    else if(msg.content.includes(":dabariana:")){
      msg.channel.send("<@498262016973078549>")
    }

    //Kevin
    else if(msg.content.includes(":laoo:")){
      msg.channel.send("<@419970850519777280>")
    }

    //Tae
    else if(msg.content.includes(":bumis:")){
      msg.channel.send("<@687482247955218483>")
    }

    //Vincent
    else if(msg.content.includes(":bang:")){
      msg.channel.send("<@136447120658923520>")
    }
    //#endregion*/
  }

	//Steve Kermit GIF
	if(msg.content.includes("<@97838330716094464>")){
		if(getRandomInt(1,100) <= 30){ 
			msg.channel.send('https://cdn.discordapp.com/attachments/765777043639762948/788514133477818429/UsherKermit.gif');
		}
  }
	
  //console.log(msg.content)
	//Jenny Elmo GIF
	if(msg.content.includes("<@491450429679468565>")){
		if(getRandomInt(1,100) <= 17){ 
			msg.channel.send('https://cdn.discordapp.com/attachments/765777043639762948/788513996763693076/elmo.gif');
    }
  }

  //Party Robyn Gif
  if(msg.content.includes("<@690663566239596615>")){
    if(getRandomInt(1,100) <= 22){
      msg.channel.send('https://cdn.discordapp.com/attachments/787254252077580289/1149162996342468608/partyoiseaur.gif')
    }
  }

  //NON CUSTOM EMOTE SECTION

  //Mingson
  if(msg.content.includes("🦧")){
    msg.channel.send("<@266023244539232257>");
  }

  if(msg.content.includes("☎️")){
    msg.channel.send({ embeds: [phonebook] });
  }
  
  if(msg.content.toLowerCase().includes("fuck")|msg.content.toLowerCase().includes("shit")|msg.content.toLowerCase().includes(" ass ")|msg.content.toLowerCase().includes(" assh")|msg.content.toLowerCase().includes("dumbass")|msg.content.toLowerCase().includes("bastard")){
    msg.channel.send("LANGUAGE");
  }
	
});


function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}


// Embeds
const cheatsheet = new Discord.EmbedBuilder()
.setColor(0x442691)
.setTitle('Helpful Links')
.setThumbnail("https://cdn.discordapp.com/attachments/765777043639762948/775839889836343336/sammy.jpg")
.addFields({
    name: "Accounts",
    value: "[IT Tools](https://ittools.ucsd.edu) | [MailUPD](https://mailupd.ucsd.edu) | [SALT](https://salt.ucsd.edu) | [Duo Admin](https://admin-ce13a1a7.duosecurity.com/) | [DSA Lookup](https://iam.ucsd.edu/dsasearch/)"
},{
    name: "Networking",
    value: "[Cisco ISE](https://m-ise-admin.ucsd.edu/) | [NCS](https://its-prime.ucsd.edu) | [Border Block](https://netapps-web2.ucsd.edu/secure/blocked-hosts/search.pl) | [NetApps](https://netapps-web.ucsd.edu/secure/wireless-auth/acl.pl) | [Starfish](https://kona.ucsd.edu/jump/starfish/)"
},{
    name: "Service Desk",
    value: "[Business Units](https://collab.ucsd.edu/display/CKB/ITS+Business+Units) | [Health Support Matrix](https://collab.ucsd.edu/display/CKB/Health+Information+Services+%28HIS%29+and+ITS+Support+Matrix+for+Customers+in+the+Healthcare+OU) | [BFP Escalations](https://collab.ucsd.edu/pages/viewpage.action?pageId=93876422) \n[Kona](https://kona.ucsd.edu) | [Service Offering Sheet](https://docs.google.com/spreadsheets/d/1EXI6k2jsAdsoPqN9ZeRBIuBOUPmCwIiNe0UWA1fwZDU/edit#gid=0)"
},{
    name: "Health Numbers",
    value: "Normal Number: (619) 543-4357 \n Queue Skip Number: (619) 543-4747"
},{
    name: "Other Numbers",
    value: "Service Desk: 858-246-4357 \nClassroom: (858) 534-5784 \nEdtech: (858) 822-3315 \nCustomer Service: (858) 534-4277 \nFacilities Management Urgent Number: (858) 534-2930"
});

const helpMenu = new Discord.EmbedBuilder()
.setColor(0x442691)
.setTitle('Help')
.addFields({
    name: "!cs and !snow",
    value: "!cs and !snow both create ticket links. Both work capital or lowercase. \n!cs can only be used for cases. If the ticket you wish to link is CS0123456, you could type !cs0123456. !cs can be used anywhere in a Discord message and does not need to be at the start. \n!snow is a more powerful version of !cs, and will work for any type of ticket, not just cases. !snow can only be used at the start of a Discord message. If you are trying to link ticket REQ0123456, you would type !snow REQ0123456."
},{
    name: "!collab",
    value: "!collab searches the Service Desk Collab Space for any text that appears after the command, then sends a link to the results."
},{
    name: "!kb",
    value: "!kb searches the Knowledge Base for any text that appears after the command, then sends a link to the results."
},{
    name: "!p",
    value: "!p will post a link to a user's MailUPD page. For example, !p jvillani links to my MailUPD record."
},{
    name: "!list and !ls",
    value: "!list and !ls are identical, and both will create a small help menu with useful links and phone numbers."
},{
    name: "!fs or !fieldsupport",
    value: "Posts Field Support map"
},{
    name: "!nato",
    value: "Posts NATO alphabet"
},{
    name: "!aloha",
    value: "World class customer service!"
},{
    name: "!parrot",
    value: "PARROT"
},{
    name: "!hyper",
    value: "SAMMY PARROT"
});

const phonebook = new Discord.EmbedBuilder()
.setColor(0x442691)
.setTitle('Phonebook')
.setThumbnail('https://cdn.discordapp.com/attachments/765777043639762948/787101249764851742/e39ec5942bc69d0a6392f507ff3321ed.png')
//... expands a list into arguments
.addFields(...phoneList)

/*.addFields({
    name: "<:snorlax:784554135420272640>",
    value: "snorlax dials Jenny"
},{
    name: "<:bandanadee:785003854857109524>",
    value: "bandanadee dials Jim"
},{
    name: "<:partyrobyn:1017136291374174311>",
    value: "partyrobyn dials Robyn. buy nitro, peasant"
},{
    name: "<:concern:1017133018390995005>",
    value: "concern dials Ivan"
},{
    name: "<:orang:1007509643762868314>",
    value: "orang dials Steven"
},{
    name: "<:orangutan:266023244539232257>",
    value: "orangutan dials Mingson"
},{
    name: "<:ThatDawg:1150857342968152211>",
    value: "ThatDawg dials Aedan"
},{
    name: "<:fingergunsleft:785979564697452574>",
    value: "fingergunsleft dials Dylan"
},{
    name: "<:laoo:1088529626105647114>",
    value: "laoo dials Kevin"
},{
    name : "<:bumis:916554784625025116>",
    value: "bumis dials Tae"
},{
    name: "<:dabariana:1150859157273055343>",
    value: "dabariana dials Ariana"
},{
    name: "<:bang:1088606779748913292>",
    value: "bang dials Vincent"
},{
    name: "@Steve",
    value: "@Steve dials Kermit 30% of the time."
},{
    name: "@Jenny",
    value: "@Jenny dials Flame Elmo 17% of the time"
},{
    name: "@Robyn",
    value: "@Robyn dials Party Robyn 22% of the time"
});*/