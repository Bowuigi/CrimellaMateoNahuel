/*====== Pokemon
type Pokemon = {
	id : Number,
	name : String,
	attack : Number,
	defense : Number,
	spriteURL : String
}
*/

// :: Number -> EffectfulPromise [Network] Pokemon
async function fetchPokemonData(id) {
	let name = "???";
	let attack = 0;
	let defense = 0;
	let spriteURL = "/img/unknown.svg";

	const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}/`);

	if (response.ok) {
		const json = await response.json();

		name = json.name || "???";
		attack = json.stats.find(x => x.stat.name == 'attack')?.base_stat || 0;
		defense = json.stats.find(x => x.stat.name == 'defense')?.base_stat || 0;
		spriteURL = json.sprites.front_default || "/img/unknown.svg";
	} // On failure we keep the default values

	return {id, name, attack, defense, spriteURL};
}

// :: (HTMLDivElement, Pokemon) -> Effect [DOM] Unit
function fillWithPokemonData(container, pokemon) {
	const containerElement = container;
	const imageElement = container.getElementsByTagName("img")[0];

	imageElement.src = pokemon.spriteURL;
	// ...
}

/*====== PokemonTeam
type PokemonTeam = {
	team : Array Pokemon,
	attack : Number
	defense : Number,
}
*/

// :: Array Pokemon -> EffectfulPromise [Network] PokemonTeam
async function fetchTeamData(pokemonIDs) {
	let team = [];
	for (let id of pokemonIDs) {
		team.push(await fetchPokemonData(id));
	}

	const {attack, defense} = team.reduce(
		(l, r) => {return {attack: l.attack + r.attack, defense: l.defense + r.defense}},
		{attack: 0, defense: 0}
	);

	return {team, attack, defense};
}

// :: (HTMLDivElement, PokemonTeam) -> Effect [DOM] Unit
function fillWithPokemonTeamData(container, pokemonTeam) {
	// ...
}

/*====== DiceThrows
type DiceThrows = {
	throws : Array {first : Number, second : Number},
	highestThrow : {index : Number, sum : Number}
}
*/

const noDiceThrows = {throws: [], highestThrow: {index: null, sum: 0}};

// :: DiceThrows -> Effect [Random] DiceThrows
function throwDice(diceThrows) {
	// Not super uniform nor cryptography-ready but good enough here
	const throwDie = () => Math.round(Math.random() * 5) + 1;

	const pair = {first: throwDie(), second: throwDie()};
	const sum = pair.first + pair.second;

	return {
		throws: [...diceThrows.throws, pair],
		highestThrow: (diceThrows.highestThrow.sum > sum)
		                ? diceThrows.highestThrow
		                : {sum, index: diceThrows.throws.length}
	};
}

// :: (HTMLDivElement, DiceThrows) -> Effect [DOM] Unit
function fillWithDiceThrowsData(container, diceThrows) {
	// ...
}

/*====== Battle
// One can leverage Javascript's structural typing to allow battles between `PokemonTeam`s and `Pokemon`s
type CanBattle = { attack : Number, defense : Number | r }
type BattleResult = {
	damageDealt : {byA : Number, byB : Number},
	result : 'a-wins' | 'b-wins' | 'draw',
	reason : 'battle' | 'dice' | 'both'
}
*/

// :: (CanBattle, CanBattle, DiceThrows, DiceThrows) -> BattleResult
function battle(teamA, teamB, diceA, diceB) {
	const damageDealt = {
		byA: Math.max(teamA.attack - teamB.defense, 0),
		byB: Math.max(teamB.attack - teamA.defense, 0)
	};

	// If they both deal the same amount of damage, the winner is decided by dice roll
	let result = 'draw';
	let reason = 'battle';

	if (damageDealt.byA > damageDealt.byB) {
		result = 'a-wins';
	} else if (damageDealt.byB > damageDealt.byA) {
		result = 'b-wins';
	} else {
		reason = 'dice';

		if (diceA.highestThrow.sum > diceB.highestThrow.sum) {
			result = 'a-wins';
		} else if (diceA.highestThrow.sum > diceB.highestThrow.sum) {
			result = 'b-wins';
		} else {
			result = 'draw';
			reason = 'both';
		}
	}

	return {damageDealt, result, reason};
}

// :: (HTMLDivElement, Battle) -> Effect [DOM] Unit
function fillWithBattleData(container, battle) {
	// ...
}
