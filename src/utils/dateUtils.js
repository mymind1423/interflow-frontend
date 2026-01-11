export const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return null;
    const dob = new Date(dateOfBirth);
    const diffMs = Date.now() - dob.getTime();
    const ageDt = new Date(diffMs);
    return Math.abs(ageDt.getUTCFullYear() - 1970);
};

export const getUTCAsLocal = (date) => {
    if (!date) return null;
    const d = new Date(date);
    return new Date(d.getTime() + d.getTimezoneOffset() * 60000);
};
