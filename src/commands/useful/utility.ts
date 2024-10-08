import { Message, EmbedBuilder } from "discord.js";
import { Command } from "../../lib/command";

export class ListCommand extends Command {
  regex = /!(ls|list)/;
  name = "!ls or !list";
  description = "Sends a small help menu with useful links and phone numbers.";

  async execute(msg: Message): Promise<void> {
    await msg.channel.send({ embeds: [this.cheatsheet] });
  }

  cheatsheet = new EmbedBuilder()
    .setColor(0x442691)
    .setTitle("Helpful Links")
    .setThumbnail("https://i.imgur.com/NTcYRwQ.jpeg")
    .addFields(
      {
        name: "Accounts",
        value:
          "[IT Tools](https://ittools.ucsd.edu) \
            | [MailUPD](https://mailupd.ucsd.edu) \
            | [SAL](https://sal.ucsd.edu/) \
            | [Duo Admin](https://admin-ce13a1a7.duosecurity.com/) \
            | [Duo Health](https://admin-5d6fd827.duosecurity.com/) \
            | [DSA Lookup](https://iam.ucsd.edu/dsasearch/)",
      },
      {
        name: "Networking",
        value:
          "[Cisco ISE](https://m-ise-admin.ucsd.edu/) \
            | [Campus Prime](https://its-prime.ucsd.edu) \
            | [ResNet Prime](https://its-prime2.ucsd.edu) \
            | [Border Block](https://netapps-web2.ucsd.edu/secure/blocked-hosts/search.pl) \
            | [Starfish](https://kona.ucsd.edu/jump/starfish/)",
      },
      {
        name: "Service Desk",
        value:
          "[Business Units](https://ucsdcollab.atlassian.net/wiki/spaces/CKB/pages/13113005/ITS+Business+Units) \
            | [Health Support Matrix](https://ucsdcollab.atlassian.net/wiki/spaces/CKB/pages/13115634/Health+Information+Services+HIS+and+ITS+Support+Matrix+for+Customers+in+the+Healthcare+OU)",
      },
      {
        name: "Health Numbers",
        value:
          "Normal Number: (619) 543-4357 \nQueue Skip Number: (619) 543-4747",
      },
      {
        name: "Other Numbers",
        value:
          "Service Desk: (858) 246-4357 \
            \nClassroom: (858) 534-5784 \
            \nEdtech: (858) 822-3315 \
            \nCustomer Service: (858) 534-4277 \
            \nFacilities Management Urgent Number: (858) 534-2930",
      },
    );
}
