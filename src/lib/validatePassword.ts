export const isValidPassword = (password: string): boolean => {
    const minLength = /.{8,}/;
    const uppercase = /[A-Z]/;
    const lowercase = /[a-z]/;
    const number = /[0-9]/;
  
    return (
      minLength.test(password) &&
      uppercase.test(password) &&
      lowercase.test(password) &&
      number.test(password)
    );
  };
  