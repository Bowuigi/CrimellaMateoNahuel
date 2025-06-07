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

// :: (HTMLDivElement, Pokemon) -> Effect [DOM, Network] ()
function fillWithPokemonData(container, pokemon) {
	const imageElement = container.getElementsByTagName("img")[0];
	const list = container.getElementsByTagName("dl")[0];

	imageElement.src = pokemon.spriteURL;
	list.getElementsByClassName("pokemon-name")[0].textContent = pokemon.name;
	list.getElementsByClassName("pokemon-attack")[0].textContent = pokemon.attack;
	list.getElementsByClassName("pokemon-defense")[0].textContent = pokemon.defense;
}

/*====== PokemonTeam
type PokemonTeam = {
	team : Array Pokemon,
	attack : Number,
	defense : Number
}
*/

// :: Array Pokemon -> EffectfulPromise [Network] PokemonTeam
async function fetchPokemonTeamData(pokemonIDs) {
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

// :: (HTMLDivElement, PokemonTeam) -> Effect [DOM, Network] ()
function fillWithPokemonTeamData(container, pokemonTeam) {
	const pokemon = container.getElementsByClassName("pokemon");
	const list = container.getElementsByClassName("team-stats")[0];

	for (let i = 0; i < pokemon.length; i++) {
		fillWithPokemonData(pokemon[i], pokemonTeam.team[i]);
	}
	list.getElementsByClassName("team-attack")[0].textContent = pokemonTeam.attack;
	list.getElementsByClassName("team-defense")[0].textContent = pokemonTeam.defense;
}

// teamA, teamB :: PokemonTeam
let teamA = {team: [], attack: 0, defense: 0};
let teamB = {team: [], attack: 0, defense: 0};

/*====== DiceThrows
type DiceThrows = {
	throws : Array {first : Number, second : Number},
	highestThrow : {sum : Number, first : Number, second : Number, index: Number}
}
*/

// :: DiceThrows
const noDiceThrows = {throws: [], highestThrow: {first: 0, second: 0, sum: 0}};

// :: DiceThrows -> Effect [Random, Mutates diceThrows] ()
function throwDice(diceThrows) {
	// Not super uniform nor cryptography-ready but good enough here
	const throwDie = () => Math.round(Math.random() * 5) + 1;

	const pair = {first: throwDie(), second: throwDie()};
	const sum = pair.first + pair.second;

	if (diceThrows.highestThrow.sum <= sum) {
		diceThrows.highestThrow = {sum, ...pair, index: diceThrows.throws.length};
	}

	diceThrows.throws.push(pair);
}

// :: (HTMLDivElement, DiceThrows) -> Effect [DOM] ()
function fillWithDiceThrowsData(container, diceThrows) {
	const list = container.getElementsByTagName("dl")[0];

	if (diceThrows.throws.length >= 3) {
		container.getElementsByTagName("button")[0].disabled = true;
	}

	for (let i = 0; i < 3; i++) {
		const class_ = `throw-${i+1}`;
		const item = list.getElementsByClassName(class_)[0];
		const pair = diceThrows.throws[i];

		if (pair === undefined) break;

		item.textContent = `${pair.first}, ${pair.second}`;
	}
	
	list.getElementsByClassName("throw-max")[0].textContent =
		`${diceThrows.highestThrow.first}, ${diceThrows.highestThrow.second} (suman ${diceThrows.highestThrow.sum}, ${diceThrows.highestThrow.index+1}° tirada)`;
}

// diceA, diceB :: DiceThrows
let diceA = structuredClone(noDiceThrows);
let diceB = structuredClone(noDiceThrows);

// throwDiceA :: () -> Effect [MutatesGlobal diceA, DOM] ()
// throwDiceB :: () -> Effect [MutatesGlobal diceB, DOM] ()
const [throwDiceA,throwDiceB] = ((...args) =>
	args.map(({team, dice}) => {
		const container = document.getElementById(`dice-team-${team}`);
		return () => {
			// JS has pass-by-value semantics only on the first layer of a structure
			// This mutates diceA or diceB depending on the argument
			throwDice(dice);
			fillWithDiceThrowsData(container, dice);
			if (dice.throws.length >= 3) {
				markAsDone(`dice-${team}-throws`);
			}
		}
	})
)(
	{team: 'a', dice: diceA},
	{team: 'b', dice: diceB}
);

// type BattleRequirement = 'api-load' | 'dice-a-throws' | 'dice-b-throws'

// :: Set BattleRequirement
let battleRequirements = new Set(['api-load', 'dice-a-throws', 'dice-b-throws']);

// :: BattleRequirement -> Effect [MutatesGlobal battleRequirements, DOM] ()
function markAsDone(requirement) {
	battleRequirements.delete(requirement);

	if (battleRequirements.size === 0) {
		document.getElementById("play-button").disabled = false;
	}
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

	let result = 'draw';
	let reason = 'battle';

	// If they both deal the same amount of damage, the winner is decided by dice roll
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

// :: (Battle) -> Effect [DOM] ()
function fillWithBattleData(battle) {
	document.getElementById("battle-result").textContent = ({
		"a-wins": "Ganó el equipo A",
		"b-wins": "Ganó el equipo B",
		"draw":   "Empate",
	})[battle.result];

	document.getElementById("battle-result-reason").textContent = ({
		battle: "Decidido por batalla",
		dice: "Decidido por dados",
		both: "Daño y mayor tirada iguales",
	})[battle.reason];

	document.getElementById("battle-team-a-damage").textContent = battle.damageDealt.byA;
	document.getElementById("battle-team-b-damage").textContent = battle.damageDealt.byB;
	document.getElementById("battle-stats").style.display = "";
}

/*====== Wiring ======*/

// teamA, teamB, diceA and diceB should have been modified by the time this function is called
// It shouldn't break anyway, the default values are valid
// :: () -> Effect [DOM] ()
function play() {
	const result = battle(teamA, teamB, diceA, diceB);
	fillWithBattleData(result);
}

// This function does not initialize everything, only the async components
// :: () -> EffectfulPromise [Network, Random, DOM, MutatesGlobal teamA, MutatesGlobal teamB] ()
async function init() {
	// Not super uniform nor cryptography-ready but good enough here
	const randomPokemon = () => Math.round(Math.random() * 1024) + 1; // 1-1025

	teamA = await fetchPokemonTeamData([randomPokemon(), randomPokemon(), randomPokemon()]);
	teamB = await fetchPokemonTeamData([randomPokemon(), randomPokemon(), randomPokemon()]);

	fillWithPokemonTeamData(document.getElementById("team-a"), teamA);
	fillWithPokemonTeamData(document.getElementById("team-b"), teamB);

	markAsDone('api-load');
}
init();
