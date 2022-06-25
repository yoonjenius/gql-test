const { ApolloServer, gql, UserInputError } = require("apollo-server");
const { v4: uuidv4 } = require("uuid");

let authors = [
   {
      name: "Robert Martin",
      id: "afa51ab0-344d-11e9-a414-719c6709cf3e",
      born: 1952,
   },
   {
      name: "Martin Fowler",
      id: "afa5b6f0-344d-11e9-a414-719c6709cf3e",
      born: 1963,
   },
   {
      name: "Fyodor Dostoevsky",
      id: "afa5b6f1-344d-11e9-a414-719c6709cf3e",
      born: 1821,
   },
   {
      name: "Joshua Kerievsky", // birthyear not known
      id: "afa5b6f2-344d-11e9-a414-719c6709cf3e",
   },
   {
      name: "Sandi Metz", // birthyear not known
      id: "afa5b6f3-344d-11e9-a414-719c6709cf3e",
   },
];

let books = [
   {
      title: "Clean Code",
      published: 2008,
      author: "Robert Martin",
      id: "afa5b6f4-344d-11e9-a414-719c6709cf3e",
      genres: ["refactoring"],
   },
   {
      title: "Agile software development",
      published: 2002,
      author: "Robert Martin",
      id: "afa5b6f5-344d-11e9-a414-719c6709cf3e",
      genres: ["agile", "patterns", "design"],
   },
   {
      title: "Refactoring, edition 2",
      published: 2018,
      author: "Martin Fowler",
      id: "afa5de00-344d-11e9-a414-719c6709cf3e",
      genres: ["refactoring"],
   },
   {
      title: "Refactoring to patterns",
      published: 2008,
      author: "Joshua Kerievsky",
      id: "afa5de01-344d-11e9-a414-719c6709cf3e",
      genres: ["refactoring", "patterns"],
   },
   {
      title: "Practical Object-Oriented Design, An Agile Primer Using Ruby",
      published: 2012,
      author: "Sandi Metz",
      id: "afa5de02-344d-11e9-a414-719c6709cf3e",
      genres: ["refactoring", "design"],
   },
   {
      title: "Crime and punishment",
      published: 1866,
      author: "Fyodor Dostoevsky",
      id: "afa5de03-344d-11e9-a414-719c6709cf3e",
      genres: ["classic", "crime"],
   },
   {
      title: "The Demon ",
      published: 1872,
      author: "Fyodor Dostoevsky",
      id: "afa5de04-344d-11e9-a414-719c6709cf3e",
      genres: ["classic", "revolution"],
   },
];

const typeDefs = gql`
   type Book {
      title: String!
      published: Int!
      author: String!
      id: ID!
      genres: [String!]!
   }
   type Author {
      name: String!
      id: ID!
      born: String
      bookCount: Int!
   }
   type Query {
      bookCount: Int!
      authorCount: Int!
      allBook(name: String!): [Book]
      allAuthors: [Author!]!
      findGener(genre: String!): [Book]
   }
   type Mutation {
      addBook(title: String!, published: Int!, author: String!, genres: [String!]!): Book
      editAuthor(name: String!, setBornTo: Int!): Author
   }
`;

const resolvers = {
   Book: {
      title: (root) => root.title,
      published: (root) => root.published,
      author: (root) => root.author,
      id: (root) => root.id,
      genres: (root) => root.genres,
   },
   Author: {
      name: (root) => root.name,
      id: (root) => root.id,
      born: (root) => root.born,
      bookCount: (root) => {
         let count = books.filter((book) => book.author === root.name);
         return count.length;
      },
   },
   Query: {
      bookCount: () => books.length,
      authorCount: () => authors.length,
      allAuthors: () => authors,
      allBook: (root, args) => books.filter((b) => b.author === args.name),
      findGener: (root, args) => {
         let tempo = [];
         books.map((book) =>
            book.genres.forEach((genre) => {
               if (genre === args.genre) {
                  tempo.push(book);
               }
            })
         );
         return tempo;
      },
   },
   Mutation: {
      addBook: (root, args) => {
         if (books.find((book) => book.title === args.title && book.author === args.author)) {
            throw new UserInputError("Title with Author must be unique", {
               invalidArgs: args.title,
            });
         }
         const book = { ...args, id: uuidv4() };
         const author = { name: book.author, id: book.id };
         books = books.concat(book);
         authors = authors.concat(author);
         return book;
      },
      editAuthor: (root, args) => {
         if (!authors.find((a) => a.name === args.name)) {
            // throw new UserInputError(`We don't habe ${args.name}`, {
            //    invalidArgs: args.name,
            // });
            return null;
         } else {
            const tempAuthor = authors.find((a) => a.name === args.name);
            const changeAuthor = { ...tempAuthor, born: args.setBornTo };
            console.log("changeAuthor", changeAuthor);
            authors = authors.map((a) => (a.name === changeAuthor.name ? changeAuthor : a));
            console.log(authors);
            return changeAuthor;
         }
      },
   },
};

const server = new ApolloServer({
   typeDefs,
   resolvers,
});

server.listen().then(({ url }) => {
   console.log(`Server ready at ${url}`);
});
