export type Promotion = {
    product: string;
    price: string;
    regularPrice: string;
    discount: string;
    additionalInfo: string;
    x: number;
    y: number;
    shop: string;
};

export const promotions: Promotion[] = [
    {
        product: "Pilsner Urquell",
        price: "0.95€",
        regularPrice: "1.42€",
        discount: "2+1 FREE",
        additionalInfo: "0.5 l bottle, 12%",
        x: 190,
        y: 425,
        shop: "Billa"
    },
    {
        product: "Orion Deli chocolate bars",
        price: "0.31€",
        regularPrice: "0.62€",
        discount: "1+1 FREE",
        additionalInfo: "various types, 35 g",
        x: 507,
        y: 425,
        shop: "Billa"
    },
    {
        product: "Rio mare Insalatissime tuna salad",
        price: "1.83€",
        regularPrice: "3.66€",
        discount: "1+1 FREE",
        additionalInfo: "various types, 160 g",
        x: 830,
        y: 425,
        shop: "Billa"
    },
    {
        product: "White seedless grapes",
        price: "1.84€",
        regularPrice: "3.69€",
        discount: "1+1 FREE",
        additionalInfo: "500 g/pack",
        x: 830,
        y: 160,
        shop: "Billa"
    },
    {
        product: "Boneless pork neck",
        price: "4.49€/kg",
        regularPrice: "7.14€/kg",
        discount: "-37%",
        additionalInfo: "chilled, Slovak origin",
        x: 190,
        y: 688,
        shop: "Billa"
    },
    {
        product: "La Grande ham",
        price: "0.99€/100 g",
        regularPrice: "1.49€/100 g",
        discount: "-33%",
        additionalInfo: "96% meat content, pork meat from the EU",
        x: 507,
        y: 688,
        shop: "Billa"
    },
    {
        product: "Calinda strawberries",
        price: "2.99€/400 g",
        regularPrice: "3.99€/400 g",
        discount: "-25%",
        additionalInfo: "country of origin: Italy",
        x: 830,
        y: 688,
        shop: "Billa"
    },
    {
        product: "Hyza whole chicken",
        price: "2.59€/kg",
        regularPrice: "3.71€/kg",
        discount: "-30%",
        additionalInfo: "chilled, Slovak origin",
        x: 190,
        y: 956,
        shop: "Billa"
    },
    {
        product: "Tami Tatranské milk 3.5%",
        price: "0.82€",
        regularPrice: "1.47€",
        discount: "-44%",
        additionalInfo: "long-life, 1 l",
        x: 507,
        y: 956,
        shop: "Billa"
    },
    {
        product: "Coca-Cola, Coca-Cola Zero, Fanta, Sprite, Zero Lime",
        price: "1.39€/1.5 l",
        regularPrice: "2.19€/1.5 l",
        discount: "-36%",
        additionalInfo: "bottle deposit 0.15€",
        x: 830,
        y: 956,
        shop: "Billa"
    },
    {
        product: "Raciol vegetable oil (rapeseed)",
        price: "1.65€/l",
        regularPrice: "2.99€/l",
        discount: "-44%",
        additionalInfo: "original price 2.99€",
        x: 830,
        y: 1217,
        shop: "Billa"
    }
];
