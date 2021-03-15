// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

/**
 * @dev a FakeRarePizzasBox is a wrapper exposing modifying contract variables for testing
 */
contract BoxArt {
    uint256 internal constant BOX_LENGTH = 100;
    uint256 internal constant MAX_BOX_INDEX = 99;

    /**
     * Get the uri for the artwork
     */
    function getUriString(uint256 index) internal pure returns (string memory) {
      string[BOX_LENGTH] memory assets = [
        'QmZgHFx4K4Qoh88gjipox4Nj3TVd48ruYiGmzN5i7etCWd',
        'QmebPHQiG9XeJr3SYgSbXBd1HjtyXz8m3MgcMZQtm2mLAy',
        'QmWoV4qG9bQB9dmzt2MnebxCW6nXaipzqGhcFaXpD1JYYW',
        'QmRayPWy2uMXRMhNwuJerxu3viDbWVM78sCyXBaPiiNQZr',
        'QmVCxQpPjbLQbUybD6B8CZYUED9qsRV3AwkR7MRFGrshLG',
        'QmUgLsimCMS9GqRXDeQjsN6zp7T4v1x57TXxdWwCUjCCud',
        'QmUEiBpEE1XmCUhVH97woLvej3XBaPHDZGynzw9m1gJFzj',
        'Qmb8W7F8soSFDaZsShBb552wWqhaNNUuAfc7r64NkCtCbe',
        'QmeDB99KU8XRKuKJnyj68H3uUij4WBdX1dTYFAPmwrG37n',
        'QmamG3HwnPoEss8LmHfVRj5GKBKZWtNwVEkMsdXMgJkjkm',
        'QmdYNqSBX1ubmdWwoNRcKnCcFszumxi5c9BLVy3rcvHKum',
        'QmUq9jq2BqMY4kbQEtWbNL5jnYKzk8LFcqdkGzqtn5ybAa',
        'QmYsVSocJWaaMtKTjCH541tXdgttvcq7RLjnuYo3EZom3U',
        'QmbgEgymCfHb9pEDzBKiCvNCD6oRB91DxoPfemqNu164v1',
        'QmYvCmHBi24bTqDvNPKMDCUUStnAK25HxJuywshApXoNbG',
        'QmQAtZMrjE6o63QMseEGtUkoqx1VrZktYQ4Z7pRju4gpUH',
        'QmfCpzrRJUYU5vCWQpSkk4sv1YuSNHose6w9neqRHrLepi',
        'QmTFyXEhABdTsuuK3fyQxRwcwiNdkQZfxLD2QfihK5paHk',
        'QmcfY3hFTwVV8pq7xGTdYU9jNneihNefpZtXYpyDQqLf6p',
        'QmWvrY3mAVganzB7fWMa3QFGw7ovvH3TXfNn7TFx4J1nkA',
        'QmXXVCtNRNCuUSbmGhocPuQ6LQFN5gZTQsQ4LeGNsZ7j2p',
        'QmQqZPmTVeSQZh4YVmy3P1NreVwoxoyZeNWc28kZa4ccbN',
        'QmYfVY9XrmFy6M4Lwg6er4MWob6se2Gmai9kQLvxEczyia',
        'QmS96aaDwV6dhCNC66AvyqVtTEgP5VkPUhj881nZYwAK6h',
        'Qmd2GcztUgUE8JqYYTXkHMTjyLLKbce35W1m8diRDdHkAH',
        'QmdgoGJ9CnL4HfYGyKhfWZnL88XP7BmPf4TwXPKccNANAB',
        'QmehQDFCjEjfNwkm5sD9DywrxA2hkMboM2RbXiypzvB3B6',
        'QmdcWiuu5zKak2D42Th72XMvgmxyfCJ8A31YiKoTS4nKKW',
        'QmYTv8twFaRGUvT7g25mms3Hi83FA9fipZvJEVFFYo4csF',
        'QmayP3UM6gMBHPRrJQwkoZNpyQA4T8ZsxMAdKkSDjqzfbv',
        'QmcBndVURW969kTaTBPUda41eise7tT9k9NHbhAmf4cbr3',
        'QmXakwTnSuTUBaEKgNmh7332TD5ZzmSkXeA3s43yyTcBxC',
        'QmR77sjoy5WsNJDeWeLF5hNPQYCWbWiczgj2pnieDx3BYh',
        'QmZfG4J1stD7KdVuQAjAaBaSP1dfc6DBJ9CpGch6hPwDTv',
        'QmWLzsWEb1idy9EUxTmD1T4EFSKP7F7K1ef67WypG7Zssg',
        'QmYtFzDbgk1facdgNyzgLueLD7KCq1bSHKnmAEnqg1C6rG',
        'QmZQKFpWMxmNC9RGBz6kQjRAwBuuEyjpYZLtjogEj1FYkf',
        'QmbBv8XjFgUY3ETLnjCvmkeHJcTPj4UPj6GV7yZvvb9nHF',
        'QmNxHdTFaF8w6icZQdAVqwkh5eTQJG6i9mYNz2UcA5TVDS',
        'QmXr3reyUVbTiTJLkyscc1AjiGjGKFwGjvyWgZ8ECLoDiv',
        'QmdDfoQZDRX7VyMuoMa16YrUqNdfXrXMMY5QUnAicMEngj',
        'QmSruFM9MBPMJoZYGBSrX7ZgqTVcMb1Bqfc2WnEEiDeJsU',
        'QmXNBHLJJzdA8JrMs87oah7ypNjdEXWPcjTUTZ3cUTMz3Y',
        'QmbB3TRFHs6FxiL4FrWePZD43sxZBP6hf3aW3prHcNBsRj',
        'QmNMQ21oSYEUjKTbfLF5UVPQ3WEMr7mucUyvxoek2Tqmgk',
        'QmUC1w4YQqMt47yL9tEhRz717Uo8agFss5pqFS1TbsE2MS',
        'QmX8ZNTyY7buX6AdeSpQ8Xb6kEhEp6StCDtN8aeKZy6fjT',
        'QmZhXK87eBajcW2dJYGYR94HC7UgLZjgg5qbvMUfdLHqeF',
        'QmUVB2qtjFwKQJaQm2jkKKKrWrde6Pg2td8Z5D1fDAVPV8',
        'QmYaEtCem15Gcyh5AnZBbUKg4oJV8xNSi97SeAzxd8MMvV',
        'QmRFSxTvJho22g8XFbKVbaXc2CZ479b13aBbdj1Etc6vhM',
        'QmUbqE7WQvd2jKVaJx2tRHTpmjiBeYeAjtyQfNeXBhnDu7',
        'QmZvcw6DZWHDyvPBhc88S4YjdKZjE6DL25AoZUPutHERUV',
        'QmWxYzsREvRWdJ25VuU72NzGUBCo2mnDd9qkVCMXdfZ1Q4',
        'QmZAyyuMVaNVjazotmohH3NPuuzLyc45ZVcfcnzzJf5tnZ',
        'QmcnJBYw7Px8bLGZRwtgZXNnavWqyHZs38dnhK78xWof8E',
        'QmZoFDx91HA2vb4v7qGnhVqDLEvswqHuufcEABN4Ghgcfn',
        'QmXWp5BgLv15kwmqw9WtYfVFEPXyurVMN3Hb2sTSUMDBU3',
        'QmT4CHTze2tthu4vRThz5BHYmQeszWniRZe1m4iaTcfFLf',
        'QmTeaxAfKmnkDGkjzVeMvWSTf1zKw4LaTv6YBpoePrW322',
        'QmStkhuz5cPVLccDaeH4c4ACuPe8VF47nttsonRPAxoB1H',
        'QmSDgHQmDXEq1Jk24cwuE1EUn9TRdywKdi1ZBkE89kgnx5',
        'QmQuuuXeaQ6Q5Up4GD8NV7LNLGSkbVQc4Vq4YXRB4SpdoZ',
        'QmULaewgmJwygsezfHvLo5K7mRewDaVHsxjqR5QdpiFfWL',
        'QmdfHrxWBJSN2HCwZAGPG58EPEgUN3VGqgwqg5xB8Ebeha',
        'QmScPZJ5uiEuRDkumv189jwSkhnvysSb67TmuUVbbLu9Je',
        'QmYer4TovoK5T83BED8GtvAev5srTgAGK9sisFQdLRL4bk',
        'QmfBaauwF7wNym93NXjxX9MSDB4BQD3S9DNkpAjunzoxSJ',
        'QmQC9K2EfaPnFkxhaNGvMSPWaqQexYTYwcMnBZNBifEtC9',
        'QmWiRUdC8jYFJoxiWQu9SYD7Whe3DFvuVMbz4fogaM1BDj',
        'QmYsKQ2uPLyNvD1kmzdrijeHWKa2Fwzsupq2L9SEnfMtTJ',
        'QmUgnYb7CMLMxyUvKDLCq6ykkQH4wm6Ga69GKQpMDTQcb1',
        'QmTuLGxwyQoJQVjuGjXXxSRhCzxDwizYmnzg5vwiopwzv6',
        'QmSYGci77YPEtTVxxXhXLvtKt6MWEREryu4skmW6HKSmzP',
        'QmTMfY4qHm68UMTxeBrPfubxKXCb8P39qPKHbePFg7hD3X',
        'QmXptaFCN4qTDbnviME4iRM4v8aAiaEpnbW8Mv2ELfYER2',
        'QmP3osAF5ipGaYnVdmQJ6u3YZxzKSkto1TNZ4jAvJa5KEd',
        'QmQsnPsWRzpB3LsqGjjRwat8W7vGZnopUmhGZS89Pod8Kj',
        'QmbPTXsCSF98avFBoPH1ewUW5ALpun6ppV4u6Fc4VoR48V',
        'Qmc38gZxucWux9BEQFbqnJQYRwxkQXkmvYcij3z8Jvu4h8',
        'QmWMQDP2ruuRDqF6ZzGQyhsWa4T3s6jmzdCgrcrxxVCQXG',
        'Qmb4khSTJpT6XAsyy7KnNAWXEPtPgWUaUdd4ycjKtGGYh3',
        'QmWNwxCLTtmhCtVVBwgLTMBzo61mA7q5SbhEgBH9xmbcD4',
        'Qmdyfvx54v827Tj9F78zTRSgZJ9ukAJ6qadP6DQefYZ4J8',
        'QmXZovT2bXFW7kizuwKsr55Hrthr3xCxArXT7SdbF8R1Yo',
        'QmWkJCyCWb5XvRSwmCnrMRu162FBb7Jrk3TxVfvQ8FS8wW',
        'Qmdo1GdgVNi6owXJAzcveRYmPanCA5n6B1izisskAonmTX',
        'QmX3Q53VbBHEYd71kemcCmXUTQi6xyBDorVoMnBpBjVRWs',
        'QmcbNfwGCzuA5rMRgPSrUQdpboLHpRMeFoCdqBCQj1XkZU',
        'QmQf31k52yyeuMJimFG44wBmcfVmh7q24NsbxEz46CFt6Z',
        'Qmcsc9a7LviurtTYDPNbHn7sjr7dwPL7qGjaziW89FuPNb',
        'QmUF9k7AzQ36ijKJppupPYTmqcGH3y82zq8k48UuEqyYVK',
        'QmZR2rDEWbSLPWNYvwtKqsasQQwZPyQjNu6H6v7S3Cun84',
        'QmYZ2arHiNQbVpGebCZRYyqdJ2e9dbfUdpZGUgWRZWt2i5',
        'QmWC14jNwaoHAfmHT7d9zYwtdGPamNibHNjd3raAD2ztcC',
        'QmUnHiiYLNrCk6minbZwViqRAssf8UZpRJFaGEdbDURSM6',
        'Qmf7h8ZnqeL4Pu76bZhcpQQRDc14gUJnkpFBv5R1BZ9Qnp',
        'QmfKQVzYQt5ZDwkQjY98FdMCcqrWQ5qsVQ5MAKbhT6H9bs',
        'QmTyd5teTPP9Ty6iW4aRBXWHppaB9gZvYJXRz7uwyNc8p1',
        'QmcBjENbnUD9AKWtDsYCvc7xWJhJk6ScEQiLmdJ5DSU6uv',
        'QmShuDTh4EeWvpmoTpXWFw6osBKG1M58fBTU53gwHS5tfB'
      ];

      require(index < assets.length, 'RAREPIZZA: requested art index is out of range');

      return assets[index];
    }
}
