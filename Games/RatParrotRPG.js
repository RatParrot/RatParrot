window.addEventListener("load", () => {
    const input = document.getElementById("terminal-input");

    // Focus immediately when page loads
    input.focus();

    // If user clicks anywhere, refocus
    window.addEventListener("mousedown", () => {
        input.focus();
    });

    // If input ever loses focus, refocus
    input.addEventListener("blur", () => {
        input.focus();
    });
});

const terminal = document.getElementById("terminal");
const input = document.getElementById("terminal-input");

function print(t) {
    terminal.innerHTML += t + "\n";
    terminal.scrollTop = terminal.scrollHeight;
}

let player = {
    name: "V",
    hp: 10,
    gold: 0
};

function handle(cmd) {
    switch (cmd) {
        case "look":
            return "You are standing in a dark void.";
        case "stats":
            return `HP: ${player.hp}\nGold: ${player.gold}`;
        case "heal":
            player.hp += 1;
            return "You feel slightly better.";
        case "gold":
            player.gold += 1;
            return "You pick up 1 gold.";
        case "help":
            return "Commands: look, stats, heal, gold";
        default:
            return "Unknown command.";
    }
}

input.addEventListener("keydown", e => {
    if (e.key === "Enter") {
        let cmd = input.value.trim();
        print("> " + cmd);
        print(handle(cmd));
        input.value = "";
    }
});

print("Basic RPG loaded. Type 'help'.");
