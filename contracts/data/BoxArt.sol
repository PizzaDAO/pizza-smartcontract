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
        string[BOX_LENGTH] memory assets =
            [
                'QmPZSwScAMJDDbdLb9iiJftDKrDBhMwaErg8TtNpj6tqfZ',
                'QmZZFjDbSdvhFw3UnKJDqhDR4bjCfRvGpAztVaPSXi8aNv',
                'QmcFyCLje9XwQBsyWKaK2VHnP6RrgoWWQ1N3XPveJSSsVw',
                'QmP8ggwLZeMr3rQxmnSmvhjuww8MQpwaCV1ASyqP6osSbx',
                'QmcEhmG9JCos6bZRqAv46xnQgUYnzUs7h6AHow76apaxW1',
                'QmbcPaiocqoLar8Uu8VBNdWJYkXJi1aXDWBqM847bxT9ep',
                'QmWWfZk5Z14KDEduRmss8okWf5b3pm2v2gtwYRaZf3iTkm',
                'QmeE6LkyWDdhGN9RKLwGXpLTkQxGNE8Tv2rjBUhX8FjvbT',
                'QmS96tKrtu5svBQzxJ9nD7cn9GPkG8gxNu9kNgVLGtap95',
                'QmNtoG8ye7j63EjeLsqKhhk5MZvqcZoSFtSXB6fiyM1PjN',
                'QmXfGAckpjQCQJaLSqytE1VN4dineTTNn1DuM7XiMYsDFu',
                'QmYarTpY5wfdN6HE3HyY7gdrW9X3xw9sTmLroKkCbSgmVt',
                'QmPYNYaPN7YxQwFZGwEftaszi51Uatm4aja9MfnyERLJ4z',
                'QmaFgcsKLFyg2kx7E1TDtWapbf5QCLZZxcmVPgfLuvScwF',
                'QmTt1BS8ztJ5J7avH1Z6tvowds5eHJft4m2YbeZ1nbATHn',
                'QmRsHMBX5XTzsmVvwBKbBRzyXv6fRtS5LpbQRfeG1WJ93T',
                'QmYRpajcgk7WzJijUqCMXAj5VKnu3idqPqmiYjYg7TbaTu',
                'QmVtKzU4nuh8uxZacwDcrx6iuTbgRpobFiitobMWkVGZXJ',
                'QmPWEuaDgwqM4Mrc2YHhULZvTqUKkWvkcqaHDr6JRKneht',
                'QmdFaskGfWG9WxavcoGxcgMcwryHqhN7KHMSNuFcCQEfWx',
                'QmevTQLKduPAqCVxEFoFgp7MqNL4j5ZT1Rt9t5WLsQ2NqS',
                'QmfHmWJUhXriTVdZLdT73XnR5PjVfgNotkw9tbN6gbP25v',
                'QmUz24D9fZoRSXLovQrY3pg9odBwur6FfKgtNyruboTSEv',
                'QmUuguAXqRaVBacNhmEpDR6JvNbFHT65NU81j4EHNRrjFL',
                'QmRkq8Bvjri5V9RYJ1yg8ivmhHcQGkrwKVtEko75VwuyoJ',
                'QmPyjajwAnX1Ey8fmYsmBkFETkLfeMjXFGRsBUBsiQgwi6',
                'QmVdhZfxR1bihrJQWdTbXcaYWksdoD8BkvTPZYNAhkKgBf',
                'QmXZ6Bz7b96autKPjZ9yUUCPNX1fVtz79NuRcSWSt3xDt7',
                'QmTyheedzWaPHhQ2koSTo3GCRCE8jCkJHtgFycGpRDCRYD',
                'QmYq9AByNpTJLs4LSjR32BpLVUr7y8mcEFG2JR3Bj5ZMFB',
                'QmWX31TW4rckrFkLnLNDUVEJoYpLvfLRYeXTNTgPBsS7R3',
                'QmYKJAtxJ9FAbyqvUB79QMLgyLKaxJYgkuPQix8PWXaSgj',
                'QmWcPa4yq6E1vBTF7zaCpCGeLfKg3EZn7U5e5ZGpVy4vYy',
                'QmTxoxurzXzFcnDD9CoeBYV2ZpZqcymP3tHTBccySZWCqE',
                'QmbX1A1hYpc9rm7maGmFxaZZJcKLUfe2Nfh9XGVV37ys2H',
                'Qmdtvn11Q1fCSPJt1YnWDwiCsWKn881yDTCns9BH8HXxu6',
                'QmQzR9JDdoTgPH8vie1bZP2oDVMaMA1NN3W7Ny9pkYfi32',
                'QmbpJdviCnS2SfUttYaz1uYCM7mnBZ7Cm7SisD333TajAy',
                'QmXf6VKJmGb6HB65ZzUy1QKegJhwFVSQ9Jzq5u4YhubLt7',
                'Qmf9ZnkvfnguGkgoXUAbo5fk6QjYG3DVG1YGBmJ8LjopR4',
                'Qmax2dtCkJAjzH73mGaKKqkzQwdUwqJjFhJCiqks2rci82',
                'QmSJZrwkCFqo2SGBXfMYfjGTTUNXRiEa6WhsQqmzLyDypc',
                'QmabMuDK6rWrVwmxJLL73dcqedcwYHC1rnL36UgAikcp2A',
                'QmUwDRNkdb84CdYs4quF834EJa58hzTBG8kUzRWpy7yjcd',
                'QmX69okJcQfpNAcgVMPAvmdiuDkVGUUXDJHuoqSkhu2Jj5',
                'QmaPoQTQiaCyAtZZPhmMNpcNodrs8DuLBFBLT7BCF7zstf',
                'QmQNijrFNVRaKziVQ7A9TF6SREq5bXpRVZEHiDZnEZ4Spf',
                'QmVxG1PePkJo4REi3dAzxD82mZwS7NSA4ixVQotpYGeqcD',
                'QmQrgZ8Kjp6KaLYNbqDqduheKRrdmiecuDw8fCsUHNAm56',
                'QmQHuLvZRN52JR1o8HMqMbaXWAckPHTkvDfCsAjGUHcpJZ',
                'QmRMJQB4ffQp722hiqq4X1PLbHjR98Cj1nR5evWzU6SNd2',
                'QmSzqevduXNJ6o6Wfa3F3qaWpg9PxU7vT8ki3iL4Gotqz4',
                'QmTsR6HnkXiZspqm9n24ipgeq43XF1MtfLA7Tvwhu64Pqx',
                'QmQ79oYGnU29wP18ZhxkMkeW94vBcfvsJWX9AjMN7gxa7u',
                'QmcqPFHKNHp4T9DJihubqErHmm1b1cNfE2C4CKPJNtrHm5',
                'QmNmA6coR6NWrx9E7MW1BEKDnsmVDeXvyTn3v3x16Z3VaW',
                'QmdyoQwYsF6kLoVYgUPjsbW6uoyPR2i1qdP6WxbXhRbhy6',
                'QmTucQKZqDKfTn4pc5ny5tv3XNAsMStmNQZNaywUfaKJLa',
                'QmTsowEk2Cr1cHwXAshWL2pioEzRmcTTsRFDDrtVnjhm5Z',
                'QmRH9j4zo7m6aM9XeyzcLUNfXTZW5yjcZTXnSPdNZ8K6ZB',
                'QmUpweqgA8fZgaypAQwPxCGtMz4JdRx8owZ2j9SQDfgCfH',
                'QmbHJU6jB9p2sRKmy4Qvzm2z9bkcHP6LVA63DNZCrP4A24',
                'QmdXQKnK2HTEQ58GHYfuTs3wRxEUkLdAS2Kq5Cbw4Ap5Fp',
                'QmXq6EoEegC8jh6RzyseCSHJVoB3CqqdueyGL1ir7YVgz8',
                'QmRNjcnbK7QF98ELvv8vk6jM1J17FmxFreVCWUTEdMV3MK',
                'Qme1WKHbMbB563NLLBPYMikcAMXEgcGyn2YVYG6a8nN2qB',
                'QmVLVDQ7HNJZAn7kt8aaExgNN1TEuGbN6bXRihD8XGa9jU',
                'QmWScLodUudjTGttVxUgdViBeYkzkAwJzpF2yU81tnSkdv',
                'QmP9YbwnjZNSKVyaAV6V2RgenWY61hwNmCHrypqmxBKoau',
                'QmdQ9CNwc8RYYkXSWpgf5vNNvoSaCncmHeufHWj3eFKqAC',
                'QmRuzLTQ2gu42GdCBnyrhNnoZaJHAK1HTv5TMCZe7GsN6u',
                'QmRuw81JK1YTAqAWCH7nMu7zZVdDbhA531CXiEeYJCsx7X',
                'QmZjTjXu8P1k9AZaWM8YZi8vE7x2GEpWMLMF3xyV87tPXs',
                'QmPGXsJ9FRk4rq3TjQiocDMsjtbTgS38nd6GuagvcYQTca',
                'QmaZRrEHSu3NU4vJThjJ9YhKYy6n92FshS9bRoCwVgQYmJ',
                'QmXSvRSDGwUjYWSV3JJRMsDTDE1DS9RDw4hAqxUmfHssTz',
                'QmUMEmaSjKb279MtsrRXCFNoFYKqDjT8JBVh4TPgJY5M6f',
                'QmPcdZ19bQuccbWnUSNagoPyUTtRwD6sthPQUE6WX9gtHE',
                'QmQSabitpP2QTsGaHLmTdWbDAUbDPxD165sWKhmyUHm3nj',
                'QmRs5DzrfArGrZ7jefT1cjzduEW3QkyAAvQGjuUq8HXkLe',
                'QmdE3H63eiXJfHU8AcjTCdFuQWoo2TYzcYzhVxH5JgA3Uv',
                'QmZTmDUZxyXi6ibcPtS8vRCpBygTrCqgqiX8JT11VMmD41',
                'QmNqwo3QpE4Bhoym8f2rGDh1JjZgetjgsBfZuNtRVmrJ4o',
                'QmeyeBcGSQX35uQGc4Td2VPBptjfF5QYifGg7Mx919oTsg',
                'QmRdDaZ8UDUPEwa1BET6NZ6DjBNN3JjEFUsbfeXfZxyxY5',
                'QmUtn9fmEggh4c39khLTryp3ds76srZWYYpNn5Jw8ugffJ',
                'QmX7b8bW2wpAXW9xSoREDpt2R38ofnjTXPzUrDXB2XVBJ5',
                'QmfUACmyJnKfsCVEEYBPaDeECUyzLLeEQgitTKkLS2mVX1',
                'QmXCLKMbEaGTZuAj7ocoaP7ygDw7EMDiLnGUUrmx2rzoJF',
                'QmaaBfroj4kKEv6CCwJxu4x6BWZbvaYd1h6a8s8pkR8hKj',
                'QmfTGkgBThQoCNPzLAPV1dQzkpUKjPr87GNfYPmTPjp3fb',
                'QmfZT2skScFATzam7wxVNSJVo2iUPBuuTd73E6TPrj8AK1',
                'QmZErbeWw4XG7LfzmCkwbnJdncwkAPAF4VwLoVHXuRTk8p',
                'QmS9oDfS7UE5aCCbHNhCkjQehXDnZQK1mSgmS9RXVry3a2',
                'QmWfNWZ7hjYtxFiv9gdBoumQHAhYNWi377DC1Fi7gjhGNu',
                'QmZfeEYCbD4x1g8R9tmWBc8At6F1T4B74sypj5VcuPDz9x',
                'QmXqyzPV5mQpRAmYiFEYjn45mfTxhigwHbtc2CG2p2dRen',
                'QmasKuM3U5w27eXBFdx3ZM4SbEPQkPui91uNAJgYDfC7Ws',
                'QmXcqVoGdn9dC2GAhMKa6zzhLkKDv58pzXRHpBwdcezWXE',
                'QmdBCDyNFyDVchtFerrkNxDKPStdj8HHabasQxW8VVDjVA'
            ];

        require(index < assets.length, 'requested index is out of range');

        return assets[index];
    }
}
