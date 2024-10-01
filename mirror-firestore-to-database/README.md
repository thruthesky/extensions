# Mirror firestore to database




## Setup

- Click the link.



## How it works


- `_lower_case` is a special field for searching. If there is a field `name` and you want to search by name, you can create a new field `name_lower_case`. By adding `_lower_case` to the field name, the value of the field will be automatically converted to lowercase and stored in the new field. This way, you can search by name without worrying about case sensitivity.


- Realtime database does not support array. If the data from Firestore is an array, it is converted as a map with the value true.

- Timestamp is stored as a number in milliseconds.

- Nested object is stored as a map.

- Any fields with null will not be stored in the database.

- geopoint is stored as `{field_name}_latitude` and `{field_name}_longitude`.



