/**
 * a
 * a
 * a
 */

export const BagError = {
    notFound: 'Bag not found',
    noKits: 'Bag has no kits -- How did this happen?',
    noName: 'Bag must be named',
}

export const ItemError = {
    notFound: 'Item not found',
}

export const KitError = {
    notFound: 'Kit not found',
    noName: 'Kit must be named',
}

export const UserError = {
    notFound: 'User not found',
    noBags: 'User has no bags',
    noEmail: 'Email required',
    noUsernameOrEmail: 'Provide Username or Email',
    invalidEmail: 'Email must be valid',
    emailAlreadyExists: 'User with email already exists',
    noUsername: 'Username required',
    usernameAlreadyExists: 'Username already taken',
    usernameLength: 'Username must contain between 4 and 15 characters',
    usernameProfanity: 'Username must not contain profanity',
    usernameInvalidChars: 'Username must contain only numbers or latin letters',
    noPassword: 'Password required',
    invalidCredentials: 'Invalid Credentials',
}

// TODO: use env var to make these empty strings in prod
export const debugTags = {
    impossible: ' -- this should be impossible',
}
