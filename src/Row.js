export class Row {
	constructor(row) {
		this.isRanked = row[0];
		this.startTime = row[1];
		this.endTime = row[2];
		this.zoneId = row[3];
		this.duration = row[4];
		this.teamName = row[5];
		this.teamColor = row[6];
		this.winnerColor = row[7];
		this.teamPlayerName1 = row[8];
		this.teamPlayerName2 = row[9];
		this.teamPlayerName3 = row[10];
		this.teamPlayerName4 = row[11];
		this.teamPlayerName5 = row[12];
		this.teamPlayerClass1 = row[13];
		this.teamPlayerClass2 = row[14];
		this.teamPlayerClass3 = row[15];
		this.teamPlayerClass4 = row[16];
		this.teamPlayerClass5 = row[17];
		this.teamPlayerRace1 = row[18];
		this.teamPlayerRace2 = row[19];
		this.teamPlayerRace3 = row[20];
		this.teamPlayerRace4 = row[21];
		this.teamPlayerRace5 = row[22];
		this.oldTeamRating = row[23];
		this.newTeamRating = row[24];
		this.diffRating = row[25];
		this.mmr = row[26];
		this.enemyOldTeamRating = row[27];
		this.enemyNewTeamRating = row[28];
		this.enemyDiffRating = row[29];
		this.enemyMmr = row[30];
		this.enemyTeamName = row[31];
		this.enemyPlayerName1 = row[32];
		this.enemyPlayerName2 = row[33];
		this.enemyPlayerName3 = row[34];
		this.enemyPlayerName4 = row[35];
		this.enemyPlayerName5 = row[36];
		this.enemyPlayerClass1 = row[37];
		this.enemyPlayerClass2 = row[38];
		this.enemyPlayerClass3 = row[39];
		this.enemyPlayerClass4 = row[40];
		this.enemyPlayerClass5 = row[41];
		this.enemyPlayerRace1 = row[42];
		this.enemyPlayerRace2 = row[43];
		this.enemyPlayerRace3 = row[44];
		this.enemyPlayerRace4 = row[45];
		this.enemyPlayerRace5 = row[46];
		this.enemyFaction = row[47];
	}
}