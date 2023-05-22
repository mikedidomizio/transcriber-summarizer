import { ApolloClient, gql, InMemoryCache } from "@apollo/client";
import { SchemaLink } from "@apollo/client/link/schema";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { read, write } from "../../utils/readWrite";
import {PrismaClient} from "@prisma/client";

// a schema is a collection of type definitions (hence "typeDefs")
// that together define the "shape" of queries that are executed against
// your data.
const typeDefs = `
  
    # Comments in GraphQL strings (such as this one) start with the hash (#) symbol.
  # This "Book" type defines the queryable fields for every book in our data source.
  type Book {
    title: String
    author: String
  }

  # the "Query" type is special: it lists all of the available queries that
  # clients can execute, along with the return type for each. in this
  # case, the "books" query returns an array of zero or more Books (defined above).
  type Query {
    books: [Book]
  }
  
  type User {
    email: String!
    name: String
  }

  type Query {
    users: [User!]!
  }
`;

const prisma = new PrismaClient();


// resolvers define the technique for fetching the types defined in the
// schema. this resolver retrieves books from the "books" array above.
export const resolvers = {
  Query: {
    users: () => {
      return prisma.user.findMany();
    }
  }
};

const schema = makeExecutableSchema({ typeDefs, resolvers });

export const graphQLClient = new ApolloClient({
  cache: new InMemoryCache(),
  ssrMode: true,
  link: new SchemaLink({ schema }),
});
