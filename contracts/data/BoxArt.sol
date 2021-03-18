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
                'QmSnxgu8V9hw8wRUSMh3MoUDShgYeHatKnTwRiVFezgUnh',
                'QmZ4q72eVU3bX95GXwMXLrguybKLKavmStLWEWVJZ1jeyz',
                'QmXTSvbDSV16Vovhj9kuPYeEE8ewo5GRMDbRUTBP2yLP5P',
                'QmbkKfCoiUp82DcmmvcU8Uceztisp2MDZaMC79PjGfsjZf',
                'QmPvhL5SQTdxJweoqNxJeD1gMdx5tQJZYWZvXy4R3b2hmU',
                'QmNPfd5F7BNmtWeqbTEpqMfWFBg2fEKUfiX9UK2tGCbgZw',
                'QmaKLRMTRTyRDRftiR4Xpfx33ZEiXUBnRN2rPx3xfXvxZX',
                'Qmb4uWgGARSyPdcj31YiUDD8RCwPkk6AwadSR7LoKVPKP6',
                'QmTj5V7CLhKRg3sNBfk7hqqHCV26frQsGuHVDxdcFHwnVL',
                'QmTD17Sp6An4eYbE782DdpkquxiUUP3AfGz4XLs85we9mM',
                'QmTBwJ2D21UJMmjG9VDFWd4zwoWJkDrMYSg2iy9eC1ZVJP',
                'QmQhLaUW3XEBPcdp276eWBfF4ePLDXqiL6y3Xv9qz9DwAS',
                'QmZf4SHZzgBiXBFXEHF8PGvjafvdY8ZmD5YTiKPzSiteD5',
                'QmRVMxmR5MPUEQe1X84q72BX8wo1fbCMyvGG2mBcnTsSEa',
                'QmVc24hyYF5dniJCPrAy7PMWY7fLeU1hxGaSP8ZjUp1vrL',
                'QmQ7BsDb5aZVBCLcrK47JmrbJCPYak9oWXRk3zE6RCMH2y',
                'QmX2VkWXiY6spRH3sEk6khsBzbuPdBJJKXxzkxu42XWqM7',
                'QmUD8uqb24732HPorZ7kD5TXPaTEqcY26mT26nGwsq1VY5',
                'QmXp4TDoDfXmENr7m85kSLrpoD5UV4Vg9EbDqgj9Q3nNXn',
                'QmPCihu3KXqqPpCBXkjzk4aaJkCdbquRn629U8osSTtjhw',
                'QmdGUp241vCFGRK52xjsDS42oXiz4pP2cacqtAQbaxGDw1',
                'QmUSVp3Ur6jiFgCEEutDWQ32Z2uFinep5n7f8zoXpqC9iy',
                'Qmb8c1TC6sHwHmZvmpwUwaak776bTncHt1tyw5WTwXyukq',
                'QmQyi6vYaTqoafEFidhv8wz5skhEnXUwddv7ke6imJZTXa',
                'QmeLfCCxdKf5xgL94tnmny11xcG9C9CF5ZQmvVk8tbYEwT',
                'QmUw5jK3E3WSXTd5Ke4SQc99wbQR3KzfUJhWJoW2k5tp4b',
                'QmPtETphemJqCBgQLurAZjRnLL73XXPrRpsdoph79BPGUA',
                'QmYPms5a1QgUFjEcd7qxcxN7knByERe45GMXcjyDtJsjMi',
                'QmdepT5F1THKiszE654pS91muBrqjL4LLVVq2XTqEvwNip',
                'QmNmP3WTN8eKypabmevxMiWJeFesb4VWD8SzfkoygAYHKX',
                'QmRk52NGwg4X7nArYkwN8RFrWBSvKjJK19c5zSLEc6jFsa',
                'Qmd64sb7Dqw6mfd2x1BuE2eSJvzezsJopm3SUtJVJwoHm4',
                'QmchRWTi7YKoZJGEaiCaGe3fx7wzsrrMDpYCXrH9J59P6U',
                'QmQfeXrAKA5zKg6L55veicNJ2RT62wJCdFzjeY7TySUjT4',
                'QmczuzS5iXXjSxKQF9gQSMEGdMpafAT9NAEJgr7V2cteCp',
                'QmesAKGGuiaveC18orbyyUzBGjyNYM6ofGkdWzaPGBaqeg',
                'QmbmLP384LQ76KDE449Y4PohvpTqpv9B7qu83euMAQHdMC',
                'QmYCKW12HzqxSfxGhoFwAsfriqPKnSZsCfFj4QXhYoTjBy',
                'Qmenbx1VhYkhaa3gXLHL1s8MLxfMieYAMFgp9RZVUZvMFq',
                'QmRNx5GtHSNzqKtRnRJEX2LTHZ1A6JCXkDD2Rex46Q29oc',
                'Qmf5ueJdG94SZ5ZmZBypfE4cxrnmETGnsrAZkt33VMpn58',
                'QmZHxu7o8VvdQxS9smEEiNFNahGULBtQ8X6KjHaZkKBs1Z',
                'QmVnaacQsafwWH8VpkZQCrnAh63EFjCNtTHA7yjsaQkrUW',
                'QmQF7vMgjudvNicj93DKBdq8h6T6kGuszCsNWEBBb3gDwH',
                'QmVSemzoNsYgX7VxvmNKR8NLJBuLmBS9zZ4hsJ71d5n5PU',
                'QmXYR19yiM1CxMo3JKDQzHKLs7iog9dp7pci9Gh5Qym1sd',
                'QmP5KcWpWzBw1QsL6iek2E1gTXsnoJ66nn1VQQk4bG5RyY',
                'QmZC3mhXxyTBvfSGG458cg5QmmWJXYQrcu3bVTZ8q7Uavr',
                'QmVBmvnizUebTzVw4YjigUer1yfVwibJNa3ygvudWQ6oeV',
                'QmX5WYvzsuydDZKpQDMd2wMFzKet1x6axH7UxaPguecH3p',
                'QmVCAE5KVKAbYLWE3XYjpqMGEy8dt1AM9gRNfJSPYuXq9G',
                'QmcYoyQ7UnBEx6sC2fQH1MGhrB3bQyKa3qVNUCwBQVxkPa',
                'QmeYWsL4gSjFUZW392rSmSqP1eLvbMUtAznToBxTq7bT5Z',
                'QmWtHkzFGdLjB3Gt9d8Ma8ZUvykpR9ARtojqXr3nYU24Z5',
                'QmeC3ZUwtk2poJKcexcK5LdwhiA7jFcLUeHrHsEgMEXuy8',
                'QmQNXJj76fGFdL6isvAGqD8cFPqkGpxppymW2qttgfdFUX',
                'QmZLxaHtp2qCbGVhAervUipS6Xhoh8tB9ommF1kHaGaKPw',
                'QmRRuzzuETKibgaKapNvdTxiud9FxjC5HVEH8eayeNfnum',
                'QmcLqe1p6hKdk6eV27Sr5chRxJyMcGjYCUasFfhPnYaLGr',
                'Qmadg5qypy5Bir5WvCsrDGVVHFLsTSTCt2gsJWGmCNoqgj',
                'Qmd6rULs8XtUcnSyUZRzqf9MkpykeCKsDEgbbZdgjwXevf',
                'QmemtVU6n9RKQDGXLgvUXjRk46NBFtzZPgn2YFN3VGWcSi',
                'QmZUT1S6m9KWjAuGhNd78bf4k8ATbTuhvLdAQVzxtU1F7M',
                'QmUgFf5jQKNGvL8zYrW2uJE9ty2NGkXWzVkX3CmakEH5C8',
                'QmepSPKMnBxFD61qZBwJGeHrtQ4Eq9SYrJj8JMaAEcYQDr',
                'Qmb4yLr4K7gsmstiprN8im2Epb3JsivBafipJKrQxZSctS',
                'QmTQjnUqDjczuCxKEeGfSTnzV1sSntJiKaYY4at5CR9e32',
                'QmNqkTZUvroMDithxpU2iRXfffP414HdsMnciUMVCDwx69',
                'QmQAzMBnqL7ZFkLGx2EvMp26xABQ7WW4U5GXUaa7Jeo3f1',
                'QmWZ95dtJ6LFB72oahyjGhd3bEb6K8enMNGFhKMGYm1L2s',
                'QmTy92vfZUYVSKQkqNpKSviUmSmgxpppr7YU4V3xciXxoK',
                'QmSXC2pcp2YAG3wAapkBsJpjcJWQQ7Z5YXuQp2ahJb3ckZ',
                'QmUV4ThFSAFyoHhsA6HN93w9s9FD8AMFxgzQc4axQF9nkX',
                'QmewqxpnbdDmW81AZpsa8Hkjr2thpv3mdGSXHPvVBpgv4w',
                'QmWJhr3zZThDX6h1itgdwZiopWMqfq4PePngfHsfhCcgUx',
                'QmVNPJFUs3P2FKWbdJDpbTniDzSZLh8ZG7kEaZJsoLtsYE',
                'QmT22hfdTWdPyW1n66sFa1jZp2dvaKYNgpt4ZFJ4kD7mwk',
                'QmNurSTpZ4JBsMsKwe1EpJkFDDsMDETUsaeNnnc8e2nBaN',
                'QmdANFtvCpceR2ngAijyorJKhnvJeXhLkvuMerBNw6fN5A',
                'QmXB15gJDSaH8Jx2APMV7WCJ4TqRwesdkCpvHVxwgReEta',
                'QmYddkxHSDr7qB7i7LrFvE3m1CPP2G4Jy1pf1318DfEgaX',
                'QmZwsto5k4PfbVRiik6wcEFsmZmfcynRLbpYt5W7MqrLWf',
                'QmRtwBg8bUsNowVA3725PAuvTupfc3s2q1UEXU4ybzjQBD',
                'QmfGaT9eBU2HnYt9aXicFewm8x8EoLFuqQafqcppiCC2zx',
                'QmTgTV7EnREdt83h4DHLsLc5Q6f25eshJX5wbShfhxf3ct',
                'QmdoD8dk4CVhZpvdmhwqrJX8fq1BQnxuW4YNF6SBigYxj6',
                'QmSsyDi4YJUYUHq9dapCuMzBXdZbAc5kYr2kc27WyfXdb6',
                'QmXeGVgSn353vnSaPHeoY22u4h7wX8gwWd2hC1XE9qqVrP',
                'QmeE2s2Xm7jVHrXtW3zo7Srku4ViKQszYXczukPCVbfM6m',
                'QmbWpxXiSVeHUwxcqRS8khFkud6ZvLG5CwdqYPpGD9CEwM',
                'Qmb3FaytE4xpVZu2xTo4oRh1q6xYTZFMxRerNSoEYWKFc9',
                'Qmb3sQQUN3aTBq3tBBbTiWsGHHmjrmFHZGqoRb6z2fRtdh',
                'QmVYw6EevH7mSbMUSiwo1zgauZoB6RvNBbQpz7Qttgbg7W',
                'QmP6QV6kZHyvMy7aMxxwnNYAYU5tgb5yW6QmPv3WW2FXeF',
                'QmcyPJvujyhYexMLJMYCtKc1zP35y7bkggtpRWCGfznNn4',
                'QmXYCgwheKJJgkEJVxt5kXVhf6MRqdMoTbhMFccu6F4Sub',
                'QmYWy1LGjwBWfZ72kBRVq9inApkBARu2zeADKX55GPgGiG',
                'QmYpnnFQnZifwULDap94ZEwoawrbPjWKGPhJcCF8c4muyr',
                'QmQGRRcdsjEjRrmHPPV4UC3C8HXfm3LNYK93puBN5zvwVg',
                'QmeDKdALtP2R2fQ76CNUpL74xdyoaJYWkdFdBzVvGZs7Vc'
            ];

        require(index < assets.length, 'requested index is out of range');

        return assets[index];
    }
}
