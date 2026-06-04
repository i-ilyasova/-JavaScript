class Weapon {
  constructor(name, attack, durability, range) {
    this.name = name;
    this.attack = attack;
    this.durability = durability;
    this.initDurability = durability;
    this.range = range;
  }

  takeDamage(damage) {
    if (this.durability === Infinity) return;
    this.durability = Math.max(0, this.durability - damage);
  }

  getDamage() {
    if (this.durability <= 0) return 0;
    if (this.durability >= this.initDurability * 0.3) {
      return this.attack;
    }
    return this.attack / 2;
  }

  isBroken() {
    return this.durability === 0;
  }
}

class Arm extends Weapon {
  constructor() {
    super('Рука', 1, Infinity, 1);
  }
}

class Bow extends Weapon {
  constructor() {
    super('Лук', 10, 200, 3);
  }
}

class Sword extends Weapon {
  constructor() {
    super('Меч', 25, 500, 1);
  }
}

class Knife extends Weapon {
  constructor() {
    super('Нож', 5, 300, 1);
  }
}

class Staff extends Weapon {
  constructor() {
    super('Посох', 8, 300, 2);
  }
}

class LongBow extends Bow {
  constructor() {
    super();
    this.name = 'Длинный лук';
    this.attack = 15;
    this.range = 4;
  }
}

class Axe extends Sword {
  constructor() {
    super();
    this.name = 'Секира';
    this.attack = 27;
    this.durability = 800;
    this.initDurability = 800;
  }
}

class StormStaff extends Staff {
  constructor() {
    super();
    this.name = 'Посох Бури';
    this.attack = 10;
    this.range = 3;
  }
}


class Player {
  constructor(position, name) {
    this.life = 100;
    this._maxLife = 100;
    this.magic = 20;
    this.speed = 1;
    this.attack = 10;
    this.agility = 5;
    this.luck = 10;
    this.description = 'Игрок';
    this.weapon = new Arm();
    this.position = position;
    this.name = name;
  }

  getLuck() {
    const randomNumber = Math.random() * 100;
    return (randomNumber + this.luck) / 100;
  }

  getDamage(distance) {
    if (distance > this.weapon.range) return 0;
    const weaponDamage = this.weapon.getDamage();
    return (this.attack + weaponDamage) * this.getLuck() / distance;
  }

  takeDamage(damage) {
    this.life = Math.max(0, this.life - damage);
  }

  isDead() {
    return this.life === 0;
  }

  moveLeft(distance) {
    const move = Math.min(distance, this.speed);
    this.position -= move;
  }

  moveRight(distance) {
    const move = Math.min(distance, this.speed);
    this.position += move;
  }

  move(distance) {
    if (distance < 0) {
      this.moveLeft(Math.abs(distance));
    } else {
      this.moveRight(distance);
    }
  }

  isAttackBlocked() {
    return this.getLuck() > (100 - this.luck) / 100;
  }

  dodged() {
    return this.getLuck() > (100 - this.agility - this.speed * 3) / 100;
  }

  takeAttack(damage) {
    if (this.isAttackBlocked()) {
      this.weapon.takeDamage(damage);
      console.log(this.name + ' заблокировал удар! Прочность ' + this.weapon.name + ': ' + this.weapon.durability.toFixed(2));
      return;
    }
    if (this.dodged()) {
      console.log(this.name + ' уклонился от удара!');
      return;
    }
    this.takeDamage(damage);
    console.log(this.name + ' получает урон ' + damage.toFixed(2) + '. Жизни: ' + this.life.toFixed(2));
  }

  checkWeapon() {

  }

  tryAttack(enemy) {
    const distance = Math.abs(this.position - enemy.position);

    if (this.weapon.range < distance) {
      console.log(this.name + ' не достаёт до ' + enemy.name + ' (дистанция: ' + distance + ', дальность: ' + this.weapon.range + ')');
      return;
    }

    this.weapon.takeDamage(10 * this.getLuck());
    this.checkWeapon();

    const effectiveDistance = Math.max(distance, 1);
    const damage = this.getDamage(effectiveDistance);

    if (distance === 0) {
      enemy.position += 1;
      console.log(this.name + ' бьёт ' + enemy.name + ' вплотную! ' + enemy.name + ' отлетает на позицию ' + enemy.position);
      enemy.takeAttack(damage * 2);
    } else {
      enemy.takeAttack(damage);
    }
  }

  chooseEnemy(players) {
    const enemies = players.filter(function (p) {
      return p !== this && !p.isDead();
    }, this);
    if (enemies.length === 0) return null;
    return enemies.reduce(function (min, p) {
      return p.life < min.life ? p : min;
    }, enemies[0]);
  }

  moveToEnemy(enemy) {
    const distance = enemy.position - this.position;
    this.move(distance);
  }

  turn(players) {
    const enemy = this.chooseEnemy(players);
    if (!enemy) return;
    console.log('\n' + this.name + ' (' + this.description + ', жизнь: ' + this.life.toFixed(2) + ') атакует: ' + enemy.name);
    this.moveToEnemy(enemy);
    this.tryAttack(enemy);
  }
}


class Warrior extends Player {
  constructor(position, name) {
    super(position, name);
    this.life = 120;
    this._maxLife = 120;
    this.speed = 2;
    this.attack = 10;
    this.description = 'Воин';
    this._weapons = [new Sword(), new Knife(), new Arm()];
    this._weaponIndex = 0;
    this.weapon = this._weapons[0];
  }

  takeDamage(damage) {
    if (this.life < this._maxLife * 0.5 && this.getLuck() > 0.8 && this.magic > 0) {
      this.magic = Math.max(0, this.magic - damage);
      console.log(this.name + ' поглощает урон ' + damage.toFixed(2) + ' маной! Мана: ' + this.magic.toFixed(2));
      return;
    }
    super.takeDamage(damage);
  }

  checkWeapon() {
    if (this.weapon.isBroken() && this._weaponIndex < this._weapons.length - 1) {
      this._weaponIndex++;
      this.weapon = this._weapons[this._weaponIndex];
      console.log(this.name + ' меняет оружие на ' + this.weapon.name);
    }
  }
}


class Archer extends Player {
  constructor(position, name) {
    super(position, name);
    this.life = 80;
    this._maxLife = 80;
    this.magic = 35;
    this.attack = 5;
    this.agility = 10;
    this.description = 'Лучник';
    this._weapons = [new Bow(), new Knife(), new Arm()];
    this._weaponIndex = 0;
    this.weapon = this._weapons[0];
  }

  getDamage(distance) {
    if (distance > this.weapon.range) return 0;
    const weaponDamage = this.weapon.getDamage();
    return (this.attack + weaponDamage) * this.getLuck() * distance / this.weapon.range;
  }

  checkWeapon() {
    if (this.weapon.isBroken() && this._weaponIndex < this._weapons.length - 1) {
      this._weaponIndex++;
      this.weapon = this._weapons[this._weaponIndex];
      console.log(this.name + ' меняет оружие на ' + this.weapon.name);
    }
  }
}


class Mage extends Player {
  constructor(position, name) {
    super(position, name);
    this.life = 70;
    this._maxLife = 70;
    this.magic = 100;
    this.attack = 5;
    this.agility = 8;
    this.description = 'Маг';
    this._weapons = [new Staff(), new Knife(), new Arm()];
    this._weaponIndex = 0;
    this.weapon = this._weapons[0];
  }

  takeDamage(damage) {
    if (this.magic > 50) {
      this.magic = Math.max(0, this.magic - 12);
      super.takeDamage(damage / 2);
      console.log(this.name + ' использует магию! Урон снижен до ' + (damage / 2).toFixed(2) + '. Мана: ' + this.magic.toFixed(2));
      return;
    }
    super.takeDamage(damage);
  }

  checkWeapon() {
    if (this.weapon.isBroken() && this._weaponIndex < this._weapons.length - 1) {
      this._weaponIndex++;
      this.weapon = this._weapons[this._weaponIndex];
      console.log(this.name + ' меняет оружие на ' + this.weapon.name);
    }
  }
}


class Dwarf extends Warrior {
  constructor(position, name) {
    super(position, name);
    this.life = 130;
    this._maxLife = 130;
    this.attack = 15;
    this.luck = 20;
    this.description = 'Гном';
    this._weapons = [new Axe(), new Knife(), new Arm()];
    this._weaponIndex = 0;
    this.weapon = this._weapons[0];
    this._hitCount = 0;
  }

  takeDamage(damage) {
    this._hitCount++;
    if (this._hitCount % 6 === 0 && this.getLuck() > 0.5) {
      console.log(this.name + ' уменьшает урон вдвое (6-й удар)!');
      damage = damage / 2;
    }
    super.takeDamage(damage);
  }
}


class Crossbowman extends Archer {
  constructor(position, name) {
    super(position, name);
    this.life = 85;
    this._maxLife = 85;
    this.attack = 8;
    this.agility = 20;
    this.luck = 15;
    this.description = 'Арбалетчик';
    this._weapons = [new LongBow(), new Knife(), new Arm()];
    this._weaponIndex = 0;
    this.weapon = this._weapons[0];
  }
}


class Demiurge extends Mage {
  constructor(position, name) {
    super(position, name);
    this.life = 80;
    this._maxLife = 80;
    this.magic = 120;
    this.attack = 6;
    this.luck = 12;
    this.description = 'Демиург';
    this._weapons = [new StormStaff(), new Knife(), new Arm()];
    this._weaponIndex = 0;
    this.weapon = this._weapons[0];
  }

  getDamage(distance) {
    if (distance > this.weapon.range) return 0;
    const weaponDamage = this.weapon.getDamage();
    const luckVal = this.getLuck();
    let damage = (this.attack + weaponDamage) * luckVal / distance;
    if (this.magic > 0 && luckVal > 0.6) {
      damage *= 1.5;
      console.log(this.name + ' усиливает удар магией!');
    }
    return damage;
  }
}


function play(players) {
  let round = 0;

  while (players.filter(function (p) { return !p.isDead(); }).length > 1) {
    round++;
    console.log('\n========== Раунд ' + round + ' ==========');

    const alive = players.filter(function (p) { return !p.isDead(); });
    alive.forEach(function (player) {
      if (!player.isDead()) {
        player.turn(players);
      }
    });

    console.log('\n--- Итог раунда ' + round + ' ---');
    players.filter(function (p) { return !p.isDead(); }).forEach(function (p) {
      console.log(p.name + ' (' + p.description + '): жизнь=' + p.life.toFixed(2) + ', позиция=' + p.position);
    });
  }

  const winner = players.find(function (p) { return !p.isDead(); });
  if (winner) {
    console.log('\n🏆 Победитель: ' + winner.name + ' (' + winner.description + ')! Жизни: ' + winner.life.toFixed(2));
    return winner;
  }
  console.log('\nНичья!');
  return null;
}


const players = [
  new Warrior(0, 'Алёша Попович'),
  new Archer(10, 'Леголас'),
  new Mage(5, 'Гендальф'),
  new Dwarf(2, 'Гимли'),
  new Crossbowman(8, 'Робин Гуд'),
  new Demiurge(6, 'Мерлин'),
];

play(players);
