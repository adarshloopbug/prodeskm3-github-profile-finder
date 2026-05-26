const searchBtn = document.getElementById("searchBtn");
const usernameInput = document.getElementById("username");

const profileCard = document.getElementById("profileCard");
const repoList = document.getElementById("repoList");
const repoSection = document.getElementById("repoSection");

const loading = document.getElementById("loading");
const error = document.getElementById("error");

const toggleBtn = document.getElementById("toggleBtn");
const normalMode = document.getElementById("normalMode");
const battleMode = document.getElementById("battleMode");

const battleBtn = document.getElementById("battleBtn");
const battleResult = document.getElementById("battleResult");

let battleActive = false;

function formatDate(dateString) {
    const date = new Date(dateString);

    return date.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric"
    });
}

async function getUser(username) {
    const response = await fetch(
        `https://api.github.com/users/${username}`
    );

    if (!response.ok) {
        throw new Error("User not found");
    }

    return await response.json();
}

async function getRepos(url) {
    const response = await fetch(url);

    return await response.json();
}

function showProfile(user) {
    profileCard.innerHTML = `
        <img src="${user.avatar_url}">
        <h2>${user.name || user.login}</h2>
        <p>${user.bio || "No bio available"}</p>
        <p><strong>Joined:</strong> ${formatDate(user.created_at)}</p>
        <p>
            <a href="${user.blog}" target="_blank">
                ${user.blog || "No Portfolio"}
            </a>
        </p>
    `;

    profileCard.classList.remove("hidden");
}

function showRepos(repos) {
    repoList.innerHTML = "";

    repos
        .sort((a, b) =>
            new Date(b.created_at) - new Date(a.created_at)
        )
        .slice(0, 5)
        .forEach(repo => {

            const li = document.createElement("li");

            li.innerHTML = `
                <a href="${repo.html_url}" target="_blank">
                    ${repo.name}
                </a>
                - ${formatDate(repo.created_at)}
            `;

            repoList.appendChild(li);
        });

    repoSection.classList.remove("hidden");
}

async function searchUser() {
    const username = usernameInput.value.trim();

    if (!username) return;

    loading.classList.remove("hidden");
    error.classList.add("hidden");

    profileCard.classList.add("hidden");
    repoSection.classList.add("hidden");

    try {
        const user = await getUser(username);

        showProfile(user);

        const repos = await getRepos(user.repos_url);

        showRepos(repos);

    } catch (err) {

        error.classList.remove("hidden");

    } finally {

        loading.classList.add("hidden");

    }
}

searchBtn.addEventListener("click", searchUser);

toggleBtn.addEventListener("click", () => {

    battleActive = !battleActive;

    if (battleActive) {

        normalMode.classList.add("hidden");
        battleMode.classList.remove("hidden");

        toggleBtn.textContent = "Switch to Normal Mode";

    } else {

        battleMode.classList.add("hidden");
        normalMode.classList.remove("hidden");

        toggleBtn.textContent = "Switch to Battle Mode";

        battleResult.innerHTML = "";
    }
});

async function battleUsers() {

    const firstUser =
        document.getElementById("user1").value.trim();

    const secondUser =
        document.getElementById("user2").value.trim();

    if (!firstUser || !secondUser) {
        return;
    }

    loading.classList.remove("hidden");

    try {

        const [userA, userB] = await Promise.all([
            getUser(firstUser),
            getUser(secondUser)
        ]);

        const [reposA, reposB] = await Promise.all([
            getRepos(userA.repos_url),
            getRepos(userB.repos_url)
        ]);

        const starsA = reposA.reduce((total, repo) => {
            return total + repo.stargazers_count;
        }, 0);

        const starsB = reposB.reduce((total, repo) => {
            return total + repo.stargazers_count;
        }, 0);

        let winner;
        let loser;

        if (starsA >= starsB) {

            winner = { user: userA, stars: starsA };
            loser = { user: userB, stars: starsB };

        } else {

            winner = { user: userB, stars: starsB };
            loser = { user: userA, stars: starsA };
        }

        battleResult.innerHTML = `
            <div class="resultContainer">

                <div class="resultCard winner">
                    <h2>Winner</h2>
                    <img src="${winner.user.avatar_url}">
                    <h3>${winner.user.login}</h3>
                    <p>Total Stars: ${winner.stars}</p>
                </div>

                <div class="resultCard loser">
                    <h2>Loser</h2>
                    <img src="${loser.user.avatar_url}">
                    <h3>${loser.user.login}</h3>
                    <p>Total Stars: ${loser.stars}</p>
                </div>

            </div>
        `;

    } catch (err) {

        battleResult.innerHTML =
            "<p style='color:red'>One or both users were not found.</p>";

    } finally {

        loading.classList.add("hidden");

    }
}

battleBtn.addEventListener("click", battleUsers);